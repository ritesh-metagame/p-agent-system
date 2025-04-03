import { Service } from "typedi";
import { RoleDao } from "../daos/role.dao";
import { UserRole } from "../common/config/constants";
import { Role, User } from "../../prisma/generated/prisma";
import { Response } from "../common/config/response";
import { ResponseCodes } from "../common/config/responseCodes";

@Service()
class RoleService {
  private roleDao: RoleDao;

  constructor() {
    this.roleDao = new RoleDao();
  }

  public async getRoleById(id: string) {
    try {
      const role = await this.roleDao.getRoleById(id);
      return role;
    } catch (error) {
      throw new Error(`Error fetching role: ${error}`);
    }
  }

  public async getRoleByName(name: string) {
    try {
      const role = await this.roleDao.getRoleByName(name);
      return role;
    } catch (error) {
      throw new Error(`Error fetching role: ${error}`);
    }
  }

  public async getAllRoles(user: User, role: string) {
    try {
      const currentUserRole = await this.roleDao.getRoleById(role);

      let roles: Role[] = [];

      if (currentUserRole.name === UserRole.SUPER_ADMIN) {
        roles = await this.roleDao.getAllRolesForSuperAdmin();
      }

      if (currentUserRole.name === UserRole.PLATINUM) {
        roles = await this.roleDao.getRoleForARole(UserRole.GOLDEN);
      }

      if (currentUserRole.name === UserRole.OPERATOR) {
        roles = await this.roleDao.getRoleForARole(UserRole.PLATINUM);
      }

      return new Response(
        ResponseCodes.ROLE_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.ROLE_FETCHED_SUCCESSFULLY.message,
        roles
      );
    } catch (error) {
      throw new Error(`Error fetching all roles: ${error}`);
    }
  }
}

export { RoleService };
