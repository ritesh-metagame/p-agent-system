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
                      category: true,
                      Site: true,
                    },
                  },
                },
              },
            },
          },
          role: true,
          category: true,
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
            name: "operator",
          },
        },
        include: {
          user: {
            include: {
              role: true,
            },
          },
          role: true,
          category: true,
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
      // Get operator's data, platinum children's data, and gold grandchildren's data
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
                  name: "platinum",
                },
              },
            },
            // Gold grandchildren's data (children of platinum agents)
            {
              user: {
                parent: {
                  parentId: operatorId,
                  role: {
                    name: "platinum",
                  },
                },
                role: {
                  name: "gold",
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
          category: true,
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
          category: true,
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
          category: true,
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
          category: true,
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
      // Get platinum's own data and their gold children's data
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
                  name: "gold",
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
          category: true,
          Site: true,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching platinum commission summaries: ${error}`);
    }
  }

  public async getCommissionPayoutReport(userId: string, categoryId?: string) {
    try {
      console.log("userId", userId); // Debugging line
      console.log("categoryId", categoryId); // Debugging line

      // Get user details with role
      const user = await prisma.user.findUnique({
        where: {
          id: userId, // Fixed: Properly passing the userId
        },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = today;

      // Base where clause
      const baseWhereClause: any = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(categoryId ? { categoryId } : {}),
      };

      // Add role-specific filters
      switch (user.role.name.toLowerCase()) {
        case "operator":
          baseWhereClause.OR = [
            { userId: user.id }, // Operator's own data
            {
              user: {
                parentId: user.id,
                role: { name: "platinum" },
              },
            }, // Platinum children
            {
              user: {
                parent: {
                  parentId: user.id,
                  role: { name: "platinum" },
                },
                role: { name: "gold" },
              },
            }, // Gold grandchildren
          ];
          break;

        case "platinum":
          baseWhereClause.OR = [
            { userId: user.id }, // Platinum's own data
            {
              user: {
                parentId: user.id,
                role: { name: "gold" },
              },
            }, // Gold children
          ];
          break;

        case "gold":
          baseWhereClause.userId = user.id; // Only their own data
          break;

        case "super_admin":
          // No additional filters - can see all data
          break;

        default:
          throw new Error("Invalid user role");
      }

      // Fetch current cycle data with role-based filtering
      const pendingSettlements = await prisma.commissionSummary.groupBy({
        by: ["categoryId"],
        where: baseWhereClause,
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

      // Fetch all-time data with the same role-based filtering
      const allTimeData = await prisma.commissionSummary.groupBy({
        by: ["categoryId"],
        where: {
          ...(categoryId ? { categoryId } : {}),
          ...baseWhereClause,
          // Remove date range for all-time data
          createdAt: undefined,
        },
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

      // Get category details if we're fetching all categories
      const categories = categoryId
        ? []
        : await prisma.category.findMany({
            where: {
              name: {
                in: ["eGames", "Sports-Betting"],
              },
            },
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: "asc",
            },
          });

      return {
        pendingSettlements,
        allTimeData,
        categories,
        periodInfo: {
          startDate,
          endDate,
        },
        userRole: user.role.name,
      };
    } catch (error) {
      throw new Error(`Error fetching commission payout report: ${error}`);
    }
  }
}

export { CommissionDao };
