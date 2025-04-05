import { Commission } from "../../prisma/generated/prisma";
import { prisma } from "../server";

class CommissionDao {
  public async createCommission(commission: any): Promise<Commission> {
    try {
      const newCommission = await prisma.commission.create({
        data: commission,
      });
      return newCommission;
    } catch (error) {
      throw new Error(`Error creating commission: ${error}`);
    }
  }

  public async updateCommission() {}

  public async deleteCommission() {}
}

export { CommissionDao };
