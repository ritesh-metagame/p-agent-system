import Container, { Service } from "typedi";
import UserDao from "../daos/user.dao";
import { RoleDao } from "../daos/role.dao";
import { Commission, Role, User } from "../../prisma/generated/prisma";
import { UserRole } from "../common/config/constants";
import { Response } from "../common/config/response";
import { ResponseCodes } from "../common/config/responseCodes";
import { BcryptService } from "../common/lib";
import { CommissionService } from "./commission.service";
import { CategoryService } from "./category.service";
import { SiteService } from "./site.service";

@Service()
class UserService {
  private userDao: UserDao;
  private roleDao: RoleDao;
  private commissionService: CommissionService;
  private categoryService: CategoryService;
  private siteService: SiteService;

  constructor() {
    this.userDao = new UserDao();
    this.roleDao = new RoleDao();
    this.commissionService = Container.get(CommissionService);
    this.categoryService = Container.get(CategoryService);
    this.siteService = Container.get(SiteService);
  }

  public async createUser(userData: Partial<User>, roleId: string, user: User) {
    try {
      const currentUserRole = await this.roleDao.getRoleById(roleId);

      console.log("Current User Role:", currentUserRole);

      let role: Role;

      if (currentUserRole.name === UserRole.SUPER_ADMIN) {
        role = await this.roleDao.getRoleByName(UserRole.OPERATOR);
      }

      if (currentUserRole.name === UserRole.OPERATOR) {
        role = await this.roleDao.getRoleByName(UserRole.PLATINUM);
      }

      if (currentUserRole.name === UserRole.PLATINUM) {
        role = await this.roleDao.getRoleByName(UserRole.GOLDEN);
      }

      if (!role) {
        throw new Error("Role not found");
      }

      const hashedPassword = await BcryptService.generateHash(
        userData.password
      );

      const data: Partial<User> = {
        ...userData,
        password: hashedPassword,
        roleId: role.id,
        parentId: user.id,
      };

      const newUser = await this.userDao.createUser(data);

      const sites = await this.siteService.getAllSites(
        user,
        currentUserRole.name
      );

      const userSite = await this.siteService.createUserSite({
        userId: newUser.id,
        siteId: sites.data[Math.floor(Math.random() * sites.data.length)].id,
      });

      const roles = await this.roleDao.getAllRolesForSuperAdmin();

      const requiredRoles = roles.filter(
        (r) => r.name !== UserRole.SUPER_ADMIN
      );

      console.log({ requiredRoles });

      const categories = await this.categoryService.getAllCategories();

      for (const r of requiredRoles) {
        for (const category of categories.data) {
          let commissionPercentage = 2.0;
          if (r.name === UserRole.PLATINUM) {
            commissionPercentage = 3.0; // Example percentage for Platinum
          } else if (r.name === UserRole.GOLDEN) {
            commissionPercentage = 2.0; // Example percentage for Golden
          } else if (r.name === UserRole.OPERATOR) {
            commissionPercentage = 5.0; // Example percentage for Operator
          }
          const commission: Partial<Commission> = {
            userId: newUser.id,
            roleId: r.id,
            categoryId: category.id,
            siteId: sites.data[0].id, // Default percentage
            commissionPercentage: commissionPercentage,
          };
          await this.commissionService.createCommission(commission);
        }
      }

      return new Response(
        ResponseCodes.USER_CREATED_SUCCESSFULLY.code,
        ResponseCodes.USER_CREATED_SUCCESSFULLY.message,
        newUser
      );
    } catch (error) {
      return new Response(
        ResponseCodes.USER_CREATED_SUCCESSFULLY.code,
        `Error creating user: ${error.message}`,
        null
      );
    }
  }
}

export { UserService };
