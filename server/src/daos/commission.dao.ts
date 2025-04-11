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

  public async getAllCommissionTransactionsByUser(userId: string) {
    // Get the logged-in user and their role
    const loggedInUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        children: {
          include: { role: true },
        },
      },
    });

    if (!loggedInUser || !loggedInUser.role) {
      throw new Error("User or user role not found.");
    }

    const roleName = loggedInUser.role.name.toLowerCase();
    let allowedRole = "";

    // Determine which role's commissions are allowed to be viewed
    switch (roleName) {
      case "superadmin":
        allowedRole = "operator";
        break;
      case "operator":
        allowedRole = "platinum";
        break;
      case "platinum":
        allowedRole = "gold";
        break;
      default:
        throw new Error("You are not authorized to view commission data.");
    }

    // Filter children by the allowed role
    const downlineUsers = loggedInUser.children.filter(
      (child) => child.role?.name.toLowerCase() === allowedRole
    );

    const downlineUserIds = downlineUsers.map((user) => user.id);

    if (downlineUserIds.length === 0) {
      return []; // No commissions if no downline users
    }

    // Fetch CommissionSummaries of those users
    const commissionSummaries = await prisma.commissionSummary.findMany({
      where: {
        userId: {
          in: downlineUserIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        role: true,
        category: true,
        Site: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totals = {
      totalDeposit: 0,
      totalWithdrawals: 0,
      totalBetAmount: 0,
      netGGR: 0,
      grossCommission: 0,
      netCommissionAvailablePayout: 0,
    };

    let totalPending = 0;
    let totalSettled = 0;

    for (const summary of commissionSummaries) {
      totals.totalDeposit += summary.totalDeposit;
      totals.totalWithdrawals += summary.totalWithdrawals;
      totals.totalBetAmount += summary.totalBetAmount;
      totals.netGGR += summary.netGGR;
      totals.grossCommission += summary.grossCommission;
      totals.netCommissionAvailablePayout +=
        summary.netCommissionAvailablePayout;

      if (summary.settledStatus === "pending") {
        totalPending += summary.netCommissionAvailablePayout;
      } else if (summary.settledStatus === "settled") {
        totalSettled += summary.netCommissionAvailablePayout;
      }
    }

    console.log("Commission Summaries:", commissionSummaries);

    return {
      summaries: commissionSummaries,
      allTotal: totals,
      totalPending: totalPending,
      totalSettled: totalSettled,
    };
  }
}

export { CommissionDao };
