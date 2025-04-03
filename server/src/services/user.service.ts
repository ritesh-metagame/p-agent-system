import { Service } from "typedi";
import UserDao from "../daos/user.dao";
import { RoleDao } from "../daos/role.dao";
import { Role, User } from "../../prisma/generated/prisma";
import { UserRole } from "../common/config/constants";
import { Response } from "../common/config/response";
import { ResponseCodes } from "../common/config/responseCodes";

@Service()
class UserService {
  private userDao: UserDao;
  private roleDao: RoleDao;

  constructor() {
    this.userDao = new UserDao();
  }

  public async createUser(userData: Partial<User>) {
    try {
      const { roleId } = userData;

      const currentUserRole = await this.roleDao.getRoleById(roleId);

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

      const data: Partial<User> = {
        ...userData,
        roleId: role.id,
        parentId: currentUserRole.id,
      };

      const newUser = await this.userDao.createUser(data);

      return new Response(
        ResponseCodes.USER_CREATED_SUCCESSFULLY.code,
        ResponseCodes.USER_CREATED_SUCCESSFULLY.message,
        newUser
      );
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }
}

export { UserService };
