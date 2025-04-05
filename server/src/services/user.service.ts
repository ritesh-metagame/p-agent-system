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
import { CategoryDao } from "../daos/category.dao";
import { toFloat } from "validator";

@Service()
class UserService {
  private userDao: UserDao;
  private roleDao: RoleDao;
  private commissionService: CommissionService;
  private categoryService: CategoryService;
  private siteService: SiteService;
  private categoryDao: CategoryDao;

  constructor() {
    this.userDao = new UserDao();
    this.roleDao = new RoleDao();
    this.commissionService = Container.get(CommissionService);
    this.categoryService = Container.get(CategoryService);
    this.siteService = Container.get(SiteService);
    this.categoryDao = new CategoryDao();
  }

  public async createUser(
    userData: Record<string, any>,
    roleId: string,
    user: User
  ) {
    try {
      const currentUserRole = await this.roleDao.getRoleById(roleId);

      console.log("Current User Role:", currentUserRole);

      console.log("User Data:", userData);

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

      console.log("New user role is:", role);

      if (!role) {
        throw new Error("Role not found");
      }

      console.log("User Data before hashing:", userData);

      const hashedPassword = await BcryptService.generateHash(
        userData.password
      );

      console.log("Hashed Password:", hashedPassword);

      const data: Partial<User> = {
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        bankName: userData.bankName,
        accountNumber: userData.accountNumber,
        password: hashedPassword,
        roleId: role.id,
        parentId: user.id,
      };

      console.log("Data to be saved:", data);

      const newUser = await this.userDao.createUser(data);

      console.log("New User Created:", newUser);

      const categories = await this.categoryDao.getAllCategories();

      console.log("Categories:", categories);

      if (userData.siteIds.length > 0) {
        for (const siteId of userData.siteIds) {
          console.log("Site ID:", siteId);
          const site = await this.siteService.createUserSite({
            userId: newUser.id,
            siteId,
          });

          if (userData.commissions.eGames) {
            console.log("Creating commission for E-Games");

            const eGamesCategory = categories.find(
              (category) => category.name === "E Games"
            );

            await this.commissionService.createCommission({
              userId: newUser.id,
              roleId: role.id,
              siteId: site.data.siteId,
              categoryId: eGamesCategory.id,
              commissionPercentage: toFloat(userData.commissions.eGames), // Example percentage for E Games
              settlementPeriod: userData.settlementDetails.period,
              settlementStartingFrom: new Date(
                userData.settlementDetails.startDate
              ).toISOString() as any,
              settlementEndingAt: new Date(
                userData.settlementDetails.endDate
              ).toISOString() as any,
            });
          }

          if (userData.commissions.sportsBetting) {
            console.log("Creating commission for Sports Betting");

            const sportsBettingCategory = categories.find(
              (category) => category.name === "Sports Betting"
            );

            await this.commissionService.createCommission({
              userId: newUser.id,
              roleId: role.id,
              siteId: site.data.siteId,
              categoryId: sportsBettingCategory.id,
              commissionPercentage: toFloat(userData.commissions.sportsBetting), // Example percentage for Sports Betting
              settlementPeriod: userData.settlementDetails.period,
              settlementStartingFrom: new Date(
                userData.settlementDetails.startDate
              ).toISOString() as any,
              settlementEndingAt: new Date(
                userData.settlementDetails.endDate
              ).toISOString() as any,
            });
          }

          if (userData.commissions.specialtyGames) {
            console.log("Creating commission for Specialty Games");

            const specialtyGamesCategory = categories.find(
              (category) => category.name === "Specialty Games"
            );

            await this.commissionService.createCommission({
              userId: newUser.id,
              roleId: role.id,
              siteId: site.data.siteId,
              categoryId: specialtyGamesCategory.id,
              commissionPercentage: toFloat(
                userData.commissions.specialtyGames
              ), // Example percentage for Specialty Games
              settlementPeriod: userData.settlementDetails.period,
              settlementStartingFrom: new Date(
                userData.settlementDetails.startDate
              ).toISOString() as any,
              settlementEndingAt: new Date(
                userData.settlementDetails.endDate
              ).toISOString() as any,
            });
          }
        }
      }

      return new Response(
        ResponseCodes.USER_CREATED_SUCCESSFULLY.code,
        ResponseCodes.USER_CREATED_SUCCESSFULLY.message,
        newUser
      );
    } catch (error) {
      console.error("Error creating user:", error);
      return error;
    }
  }

  public async getUsersByParentId(partnerId: string) {
    try {
      const users = await this.userDao.getUsersByParentId(partnerId);

      return new Response(
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.message,
        users
      );
    } catch (error) {
      return new Response(
        ResponseCodes.USERS_FETCHED_FAILED.code,
        `Error fetching users: ${error.message}`,
        null
      );
    }
  }

  public async getAllUsers(startDate?: string, endDate?: string) {
    try {
      const users = await this.userDao.getAllUsersWithDetails(
        startDate,
        endDate
      );

      return new Response(
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.message,
        users
      );
    } catch (error) {
      return new Response(
        ResponseCodes.USERS_FETCHED_FAILED.code,
        `Error fetching all users: ${error.message}`,
        null
      );
    }
  }
}

export { UserService };
