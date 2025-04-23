import { Commission, User } from "../../prisma/generated/prisma";
import { UserRole } from "../common/config/constants";
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

  public async getCommissionSummaries() {
    try {
      const summaries = await prisma.commissionSummary.findMany({
        include: {
          user: {
            include: {
              role: true,
              children: {
                include: {
                  role: true,
                  commissionSummaries: {
                    include: {
                      Site: true,
                    },
                  },
                },
              },
            },
          },
          role: true,
          Site: true,
        },
      });
      return summaries;
    } catch (error) {
      throw new Error(`Error fetching commission summaries: ${error}`);
    }
  }

  public async getSuperAdminCommissionSummaries() {
    try {
      // Get all operators' summaries
      return await prisma.commissionSummary.findMany({
        where: {
          role: {
            name: UserRole.OPERATOR as string,
          },
        },
        include: {
          user: {
            include: {
              role: true,
            },
          },
          role: true,
          Site: true,
        },
      });
    } catch (error) {
      throw new Error(
        `Error fetching super admin commission summaries: ${error}`
      );
    }
  }

  public async getOperatorCommissionSummaries(operatorId: string) {
    try {
      // Get operator's data, platinum children's data, and golden grandchildren's data
      return await prisma.commissionSummary.findMany({
        where: {
          OR: [
            // Operator's own data
            { userId: operatorId },
            // Platinum children's data
            {
              user: {
                parentId: operatorId,
                role: {
                  name: UserRole.PLATINUM as string,
                },
              },
            },
            // Gold grandchildren's data (children of platinum agents)
            {
              user: {
                parent: {
                  parentId: operatorId,
                  role: {
                    name: UserRole.PLATINUM as string,
                  },
                },
                role: {
                  name: UserRole.GOLDEN as string,
                },
              },
            },
          ],
        },
        include: {
          user: {
            include: {
              role: true,
              parent: {
                include: {
                  role: true,
                },
              },
            },
          },
          role: true,
          Site: true,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching operator commission summaries: ${error}`);
    }
  }

  public async getCommissionSummariesForSuperAdmin() {
    try {
      const summaries = await prisma.commissionSummary.findMany({
        where: {
          role: {
            name: "Operator",
          },
        },
        include: {
          user: true,
          role: true,
          Site: true,
        },
      });
      return summaries;
    } catch (error) {
      throw new Error(
        `Error fetching commission summaries for super admin: ${error}`
      );
    }
  }

  public async getCommissionSummariesForOperator(operatorId: string) {
    try {
      const summaries = await prisma.commissionSummary.findMany({
        where: {
          OR: [
            { userId: operatorId },
            {
              user: {
                parentId: operatorId,
                role: {
                  name: "Platinum",
                },
              },
            },
          ],
        },
        include: {
          user: true,
          role: true,
          Site: true,
        },
      });
      return summaries;
    } catch (error) {
      throw new Error(
        `Error fetching commission summaries for operator: ${error}`
      );
    }
  }

  public async getCommissionSummariesForUser(userId: string) {
    try {
      const summaries = await prisma.commissionSummary.findMany({
        where: {
          userId: userId,
        },
        include: {
          user: true,
          role: true,
          Site: true,
        },
      });
      return summaries;
    } catch (error) {
      throw new Error(`Error fetching commission summaries for user: ${error}`);
    }
  }

  public async getPlatinumCommissionSummaries(platinumId: string) {
    try {
      // Get platinum's own data and their golden children's data
      return await prisma.commissionSummary.findMany({
        where: {
          OR: [
            // Platinum's own data
            { userId: platinumId },
            // Gold children's data
            {
              user: {
                parentId: platinumId,
                role: {
                  name: UserRole.GOLDEN as string,
                },
              },
            },
          ],
        },
        include: {
          user: {
            include: {
              role: true,
              parent: {
                include: {
                  role: true,
                },
              },
            },
          },
          role: true,
          Site: true,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching platinum commission summaries: ${error}`);
    }
  }

  public async getCommissionPayoutReport(
    userId: string,
    categoryName?: string,
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      const whereClause: any = {
        userId,
      };

      if (categoryName) {
        whereClause.categoryName = categoryName;
      }

      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }

      const pendingSettlements = await prisma.commissionSummary.groupBy({
        by: ["categoryName"],
        where: whereClause,
        _sum: {
          totalDeposit: true,
          totalWithdrawals: true,
          totalBetAmount: true,
          netGGR: true,
          grossCommission: true,
          paymentGatewayFee: true,
          netCommissionAvailablePayout: true,
        },
      });

      // For all-time data, we don't apply the date filter
      const allTimeWhereClause = { ...whereClause };
      delete allTimeWhereClause.createdAt;

      const allTimeData = await prisma.commissionSummary.groupBy({
        by: ["categoryName"],
        where: allTimeWhereClause,
        _sum: {
          totalDeposit: true,
          totalWithdrawals: true,
          totalBetAmount: true,
          netGGR: true,
          grossCommission: true,
          paymentGatewayFee: true,
          netCommissionAvailablePayout: true,
        },
      });

      return {
        pendingSettlements,
        allTimeData,
      };
    } catch (error) {
      throw new Error(`Error generating commission payout report: ${error}`);
    }
  }

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

    const roleName = loggedInUser.role.name.toLowerCase() as UserRole;
    let allowedRole = "" as UserRole;

    // Determine which role's commissions are allowed to be viewed
    switch (roleName) {
      case UserRole.SUPER_ADMIN:
        allowedRole = UserRole.OPERATOR;
        break;
      case UserRole.OPERATOR:
        allowedRole = UserRole.PLATINUM;
        break;
      case UserRole.PLATINUM:
        allowedRole = UserRole.GOLDEN;
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

      if (summary.settledStatus === "N") {
        totalPending += summary.netCommissionAvailablePayout;
      } else if (summary.settledStatus === "Y") {
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

  public async getUnsettledCommissionSummaries() {
    try {
      const summaries = await prisma.commissionSummary.findMany({
        where: {
          settledStatus: "N",
        },
        include: {
          user: true,
          role: true,
          Site: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return summaries;
    } catch (error) {
      console.error("Error fetching unsettled commission summaries:", error);
      throw error;
    }
  }

  public async markCommissionAsSettled(ids: string[]) {
    try {
      const updatedSummary = await prisma.commissionSummary.updateMany({
        where: {
          id: { in: ids },
        },
        data: {
          settledStatus: "Y",
          settledAt: new Date(),
        },
      });

      return updatedSummary;
    } catch (error) {
      console.error("Error updating settledStatus:", error);
      throw error;
    }
  }
}

export { CommissionDao };
