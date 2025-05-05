import {
  Commission,
  CommissionSummary,
  User,
} from "../../prisma/generated/prisma";
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

  public async getCommissionByUserId(userId: string): Promise<Commission[]> {
    try {
      const commissions = await prisma.commission.findMany({
        where: { userId },
        include: {
          user: true,
          role: true,
          site: true,
          category: true,
        },
      });
      return commissions;
    } catch (error) {
      throw new Error(`Error fetching commission by user ID: ${error}`);
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

  private async getPaymentGatewayFee(
    userIds: string[],
    settled: boolean = false,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const commissions = await prisma.commissionSummary.findMany({
      where: {
        userId: { in: userIds },
        paymentGatewayFee: {
          gte: 0,
        },
        // ...(settled ? { settledStatus: "Y" } : { settledStatus: "N" }),
        ...(startDate && endDate
          ? { createdAt: { gte: startDate, lte: endDate } }
          : {}),
      },
      select: { paymentGatewayFee: true },
    });

    return commissions.reduce(
      (total, commission) => total + (commission.paymentGatewayFee || 0),
      0
    );
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

    let userIds = [userId];

    if (!loggedInUser || !loggedInUser.role) {
      throw new Error("User or user role not found.");
    }

    const roleName = loggedInUser.role.name.toLowerCase() as UserRole;
    let allowedRole = "" as UserRole;

    let settledOids = [];
    let settledPids = [];
    let settledGids = [];

    let settledSummaries = [];

    let pendingPaymentGatewayFee = 0;
    let settledPaymentGatewayFee = 0;

    if (roleName === UserRole.SUPER_ADMIN) {
      const oChildens = await prisma.user.findMany({
        where: {
          parentId: userId,
        },
        select: {
          id: true,
        },
      });

      const oChildensIds = oChildens.map((child) => child.id);
      userIds = oChildensIds;

      const pChildrens = await prisma.user.findMany({
        where: {
          parentId: { in: oChildensIds },
        },
        select: {
          id: true,
        },
      });

      const pChildrensIds = pChildrens.map((child) => child.id);

      userIds = [...userIds, ...pChildrensIds];

      const gChildrens = await prisma.user.findMany({
        where: {
          parentId: { in: pChildrensIds },
        },
        select: {
          id: true,
        },
      });
      const gChildrensIds = gChildrens.map((child) => child.id);

      userIds = [...userIds, ...gChildrensIds];

      const settledData = await prisma.commissionSummary.findMany({
        where: {
          userId: { in: oChildensIds },
          settledStatus: "Y",
        },
        select: {
          userId: true,
          categoryName: true,
          totalBetAmount: true,
          netGGR: true,
          grossCommission: true,
          paymentGatewayFee: true,
          netCommissionAvailablePayout: true,
        },
      });

      const settledUserIds = settledData.map((data) => data.userId);

      settledOids = settledUserIds;

      // Fetch non-settled data for operators and their hierarchy
      // Check if there are any non-settled data for the same users

      const nonSettledPlatinumChildren = await prisma.user.findMany({
        where: {
          parentId: { in: settledUserIds },
          role: { name: UserRole.PLATINUM },
        },
        select: { id: true },
      });

      settledPids = nonSettledPlatinumChildren.map((platinum) => platinum.id);

      const nonSettledGoldenChildren = await prisma.user.findMany({
        where: {
          parentId: {
            in: nonSettledPlatinumChildren.map((platinum) => platinum.id),
          },
          role: { name: UserRole.GOLDEN },
        },
        select: { id: true },
      });

      settledGids = nonSettledGoldenChildren.map((golden) => golden.id);

      if (settledData.length !== 0) {
        const settledDataForNonSettled =
          await prisma.commissionSummary.findMany({
            where: {
              userId: {
                in: [
                  ...nonSettledPlatinumChildren.map((ch) => ch.id),
                  ...nonSettledGoldenChildren.map((ch) => ch.id),
                ],
              },
            },
            select: {
              userId: true,
              categoryName: true,
              totalBetAmount: true,
              netGGR: true,
              grossCommission: true,
              paymentGatewayFee: true,
              netCommissionAvailablePayout: true,
            },
          });

        settledData.push(...settledDataForNonSettled);

        console.log("Settled Data:", settledData);

        settledSummaries = settledData;
      }

      pendingPaymentGatewayFee = await this.getPaymentGatewayFee(
        gChildrensIds,
        false,
        undefined,
        undefined
      );

      settledPaymentGatewayFee = await this.getPaymentGatewayFee(
        settledUserIds,
        true,
        undefined,
        undefined
      );
    } else if (roleName === UserRole.OPERATOR) {
      const platinums = await prisma.user.findMany({
        where: {
          parentId: userId,
          role: { name: UserRole.PLATINUM },
        },
        select: { id: true },
      });

      userIds = platinums.map((platinum) => platinum.id);

      const goldens = await prisma.user.findMany({
        where: {
          parentId: { in: platinums.map((platinum) => platinum.id) },
          role: { name: UserRole.GOLDEN },
        },
        select: { id: true },
      });

      userIds = userIds.concat(goldens.map((golden) => golden.id));

      // Fetch settled data for platinums and their hierarchy
      const settledData = await prisma.commissionSummary.findMany({
        where: {
          userId: { in: platinums.map((platinum) => platinum.id) },
          settledStatus: "Y",
        },
        select: {
          userId: true,
          categoryName: true,
          totalBetAmount: true,
          netGGR: true,
          grossCommission: true,
          paymentGatewayFee: true,
          netCommissionAvailablePayout: true,
        },
      });

      const settledUserIds = settledData.map((data) => data.userId);

      settledPids = settledUserIds;

      // Fetch non-settled data for operators and their hierarchy
      // Check if there are any non-settled data for the same users

      const nonSettledGoldenChildren = await prisma.user.findMany({
        where: {
          parentId: {
            in: settledPids,
          },
          role: { name: UserRole.GOLDEN },
        },
        select: { id: true },
      });

      settledGids = nonSettledGoldenChildren.map((golden) => golden.id);

      if (settledData.length !== 0) {
        const settledDataForNonSettled =
          await prisma.commissionSummary.findMany({
            where: {
              userId: {
                in: [...nonSettledGoldenChildren.map((ch) => ch.id)],
              },
              // settledStatus: "N",
            },
            select: {
              userId: true,
              categoryName: true,
              totalBetAmount: true,
              netGGR: true,
              grossCommission: true,
              paymentGatewayFee: true,
              netCommissionAvailablePayout: true,
            },
          });

        settledData.push(...settledDataForNonSettled);
      }

      // settledData.push(...settledDataForNonSettled);

      console.log("Settled Data:", settledData);

      settledSummaries = settledData;

      pendingPaymentGatewayFee = await this.getPaymentGatewayFee(
        goldens.map((golden) => golden.id),
        false,
        undefined,
        undefined
      );

      settledPaymentGatewayFee = await this.getPaymentGatewayFee(
        settledUserIds,
        true,
        undefined,
        undefined
      );
    } else if (roleName === UserRole.PLATINUM) {
      const goldens = await prisma.user.findMany({
        where: {
          parentId: userId,
          role: { name: UserRole.GOLDEN },
        },
        select: { id: true },
      });

      userIds = goldens.map((golden) => golden.id);

      // Fetch settled data for goldens
      const settledData = await prisma.commissionSummary.findMany({
        where: {
          userId: { in: userIds },
          settledStatus: "Y",
        },
        select: {
          userId: true,
          categoryName: true,
          totalBetAmount: true,
          netGGR: true,
          grossCommission: true,
          paymentGatewayFee: true,
          netCommissionAvailablePayout: true,
        },
      });

      settledSummaries = settledData;

      settledGids = settledData.map((data) => data.userId);

      // gIds = [...goldens.map((golden) => golden.id)];

      pendingPaymentGatewayFee = await this.getPaymentGatewayFee(
        userIds,
        false,
        undefined,
        undefined
      );

      settledPaymentGatewayFee = await this.getPaymentGatewayFee(
        userIds,
        true,
        undefined,
        undefined
      );
    }

    let settledIds = new Set([...settledOids, ...settledPids, ...settledGids]);

    let filteredUserIds = userIds.filter((id) => !settledIds.has(id));

    // Fetch CommissionSummaries of those users
    const commissionSummaries = await prisma.commissionSummary.findMany({
      where: {
        userId: {
          in: filteredUserIds,
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

    const pendingPaymentGatewayFees = commissionSummaries.filter(
      (summary) =>
        summary.user.role.name === UserRole.GOLDEN &&
        summary.settledStatus === "N"
    );

    const settledPaymentGatewayFees = commissionSummaries.filter(
      (summary) =>
        summary.user.role.name === UserRole.GOLDEN &&
        summary.settledStatus === "Y"
    );

    const pendingPaymentGatewayFeeSum = pendingPaymentGatewayFees.reduce(
      (acc, summary) => acc + summary.paymentGatewayFee,
      0
    );

    const settledPaymentGatewayFeeSum = settledPaymentGatewayFees.reduce(
      (acc, summary) => acc + summary.paymentGatewayFee,
      0
    );

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

    console.log("Settled Summaries:", settledSummaries);

    for (const summary of settledSummaries) {
      totalSettled += summary.netCommissionAvailablePayout;
    }

    console.log("Total Settled:", totalSettled);

    for (const summary of commissionSummaries) {
      // totals.totalDeposit += summary.totalDeposit;
      // totals.totalWithdrawals += summary.totalWithdrawals;
      // totals.totalBetAmount += summary.totalBetAmount;
      // totals.netGGR += summary.netGGR;
      // totals.grossCommission += summary.grossCommission;
      // totals.netCommissionAvailablePayout +=
      //   summary.netCommissionAvailablePayout;

      if (summary.settledStatus === "N") {
        totalPending += summary.netCommissionAvailablePayout;
      }
    }


    console.group(totalPending, totalPending);

    return {
      summaries: commissionSummaries,
      allTotal: totals,
      totalPending: totalPending > 0 ? totalPending - pendingPaymentGatewayFeeSum : 0,
      totalSettled: totalSettled > 0 ? totalSettled - settledPaymentGatewayFee : 0,
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
      // First get the current records with their user roles
      const currentRecords = await prisma.commissionSummary.findMany({
        where: {
          id: { in: ids },
        },
        select: {
          id: true,
          pendingSettleCommission: true,
          netCommissionAvailablePayout: true,
          paymentGatewayFee: true,
          user: {
            select: {
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        },
      });

      // Separate golden users from others
      const goldenRecords = currentRecords.filter(record => record.user.role.name === UserRole.GOLDEN);
      const otherRecords = currentRecords.filter(record => record.user.role.name !== UserRole.GOLDEN);

      // Calculate ratio only for golden users
      const totalGoldenNetCommission = goldenRecords.reduce(
        (sum, record) => sum + record.netCommissionAvailablePayout,
        0
      );

      // Get the total paymentGatewayFee (should be same value for all records)
      const totalPaymentGatewayFee = currentRecords[0]?.paymentGatewayFee || 0;

      // Update golden records with ratio-based payment gateway fee
      const updatedGoldenRecords = await Promise.all(
        goldenRecords.map(record => {
          // Calculate this record's ratio of the total commission
          const ratio = record.netCommissionAvailablePayout / totalGoldenNetCommission;
          // Calculate this record's share of the payment gateway fee based on its ratio
          const recordPaymentGatewayFee = totalPaymentGatewayFee * ratio;

          return prisma.commissionSummary.update({
            where: { id: record.id },
            data: {
              settledStatus: "Y",
              settledAt: new Date(),
              pendingSettleCommission: (record.pendingSettleCommission || 0) - (record.netCommissionAvailablePayout - recordPaymentGatewayFee),
            },
          });
        })
      );

      // Update other records without ratio calculation
      const updatedOtherRecords = await Promise.all(
        otherRecords.map(record => {
          return prisma.commissionSummary.update({
            where: { id: record.id },
            data: {
              settledStatus: "Y",
              settledAt: new Date(),
              pendingSettleCommission: (record.pendingSettleCommission || 0) - record.netCommissionAvailablePayout,
            },
          });
        })
      );

      return [...updatedGoldenRecords, ...updatedOtherRecords];
    } catch (error) {
      console.error("Error updating settledStatus:", error);
      throw error;
    }
  }
}

export { CommissionDao };
