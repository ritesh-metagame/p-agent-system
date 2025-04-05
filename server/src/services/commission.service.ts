import { Service } from "typedi";
import { Commission, User } from "../../prisma/generated/prisma";
import { CommissionDao } from "../daos/commission.dao";
import { RoleDao } from "../daos/role.dao";

@Service()
class CommissionService {
  private commissionDao: CommissionDao;
  private roleDao: RoleDao;

  constructor() {
    this.commissionDao = new CommissionDao();
    this.roleDao = new RoleDao();
  }

  public async createCommission(commission: Partial<Commission>) {
    try {
      // Using the instance variable instead of creating a new instance
      const newCommission =
        await this.commissionDao.createCommission(commission);
      return newCommission;
    } catch (error) {
      throw new Error(`Error creating commission: ${error}`);
    }
  }
}

export { CommissionService };
