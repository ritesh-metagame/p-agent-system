import { prisma } from "../server";
import type { User } from "../../prisma/generated/prisma";

class UserDao {
  constructor() {}

  public async getUserByUserId(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      console.log("User fetched:", user);

      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error}`);
    }
  }

  public async getUserByUsername(username: string) {
    console.log("Username:", username); // Debugging line
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        include: { role: true },
      });
      console.log("Username1111111111111:", username); // Debugging line

      console.log("User fetched:", user);

      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error}`);
    }
  }

  public async createUser({ ...data }: Record<string, any>): Promise<User> {
    const affiliateLink: string = `https://example.com/${data?.username}`; // Example affiliate link generation

    try {
      const user = await prisma.user.create({
        data: {
          ...(data as any),
          affiliateLink,
        },
      });

      return user;
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  public async getUsersByParentId(parentId: string) {
    try {
      const users = await prisma.user.findMany({
        where: { parentId },
        include: {
          role: true,
          commissions: {
            include: {
              category: true,
              site: true,
            },
          },
          userSites: true,
          children: true,
        },
      });

      return users;
    } catch (error) {
      throw new Error(`Error fetching users by parent ID: ${error}`);
    }
  }

  // public async getAllUsersWithDetails(startDate?: string, endDate?: string) {
  //   try {
  //     const whereClause: any = {}; // Initialize an empty where clause

  //     if (startDate && endDate) {
  //       whereClause.createdAt = {
  //         gte: new Date(startDate), // Greater than or equal to startDate
  //         lte: new Date(endDate), // Less than or equal to endDate
  //       };
  //     }

  //     const users = await prisma.user.findMany({
  //       where: whereClause, // Apply the filtering condition
  //       include: {
  //         role: true,
  //         commissions: {
  //           include: {
  //             category: true,
  //             site: true,
  //           },
  //         },
  //         userSites: {
  //           include: {
  //             site: true,
  //           },
  //         },
  //       },
  //     });

  //     return users;
  //   } catch (error) {
  //     throw new Error(`Error fetching users with details: ${error}`);
  //   }
  // }

  public async getAllUsersWithDetails(startDate?: string, endDate?: string) {
    try {
      // Step 1: Get unique Commission IDs (grouped)
      const groupedCommissions = await prisma.commission.groupBy({
        by: ["id"],
      });

      const commissionIds = groupedCommissions.map((c) => c.id);

      // Step 2: Fetch full details for grouped Commission IDs
      const commissions = await prisma.commission.findMany({
        where: {
          id: { in: commissionIds },
        },
        include: {
          site: true,
          user: true,
          role: true,
          category: true,
        },
      });

      return commissions;
    } catch (error) {
      throw new Error(`Error fetching grouped commissions: ${error.message}`);
    }
  }

  public async getTransactionsByCategoryName() {
    try {
      const transactions = await prisma.transaction.findMany({
        select: {
          // ✅ Transaction fields (same as before)
          id: true,
          betId: true,
          settlementTime: true,
          timeOfBet: true,
          outletId: true,
          playerId: true,
          playerName: true,
          transactionId: true,
          gameId: true,
          gameName: true,
          gameType: true,
          gameProvider: true,
          machineId: true,
          betAmount: true,
          payoutAmount: true,
          refundAmount: true,
          depositAmount: true,
          withdrawAmount: true,
          jackpotContribution: true,
          jackpotPayout: true,
          seedContriAmount: true,
          jackpotType: true,
          jackpotDetails: true,
          channelType: true,
          brand: true,
          sport: true,
          ticketStatus: true,
          prematchLive: true,
          kioskTerminal: true,
          platformCode: true,
          platformName: true,
          gameStatusId: true,
          roundId: true,
          siteId: true,
          agentAdminId: true,
          agentAdminName: true,
          agentOwnerId: true,
          agentOwnerName: true,
          agentMasterId: true,
          agentMasterName: true,
          agentGoldenId: true,
          agentGoldenName: true,
          agentUserType: true,
          ownerActualPercentage: true,
          ownerPercentage: true,
          masterAgentPercentage: true,
          goldenAgentPercentage: true,
          ggrAmount: true,
          totalCommission: true,
          ownerCommission: true,
          masterAgentCommission: true,
          goldenAgentCommission: true,
          depositCommission: true,
          withdrawCommission: true,
          transactionType: true,
          status: true,
          settled: true,
          timestamp: true,
          createdAt: true,
          updatedAt: true,

          // ✅ User hierarchy with commissions
          agentGolden: {
            select: {
              id: true,
              username: true,
              role: true,
              commissions: {
                select: {
                  category: true,
                  commissionPercentage: true,
                },
              },
              parent: {
                select: {
                  id: true,
                  username: true,
                  role: true,
                  commissions: {
                    select: {
                      category: true,
                      commissionPercentage: true,
                    },
                  },
                  parent: {
                    select: {
                      id: true,
                      username: true,
                      role: true,
                      commissions: {
                        select: {
                          category: true,
                          commissionPercentage: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      const res = await this.createTransactionSummary(transactions);
      return res;
    } catch (error) {
      throw new Error(`Error fetching all transactions: ${error}`);
    }
  }

  public async createTransactionSummary(transactions: any[]) {
    function extractDecimal({ s, e, d }: any): number {
      const num =
        parseFloat(d.join("")) * Math.pow(10, e - (d.join("").length - 1));
      return s === -1 ? -num : num;
    }

    function getCommission(agent: any, categoryId: string): number {
      const match = agent?.commissions?.find(
        (c: any) => c.category.id === categoryId
      );
      return match ? match.commissionPercentage : 0;
    }

    const results = [];

    for (const transaction of transactions) {
      try {
        const golden = transaction.agentGolden;
        if (!golden || !golden.commissions?.length) {
          console.warn(
            "Missing golden agent or commissions for transaction:",
            transaction.transactionId
          );
          continue; // skip to next transaction
        }

        const category = golden.commissions[0].category;
        if (!category) {
          console.warn(
            "Missing category for transaction:",
            transaction.transactionId
          );
          continue;
        }

        const categoryId = category.id;
        const categoryName = category.name;
        const betAmount = transaction.betAmount;

        const goldenPercentage = getCommission(golden, categoryId);
        const goldenAmount = (betAmount * goldenPercentage) / 100;

        console.log("Golden Agent Percentage:", goldenAmount);

        const platinum = golden.parent;
        const platinumPercentage = getCommission(platinum, categoryId);
        const platinumAmount = (betAmount * platinumPercentage) / 100;

        const operator = platinum?.parent;
        const operatorPercentage = getCommission(operator, categoryId);
        const operatorAmount = (betAmount * operatorPercentage) / 100;

        const [goldenInfo, platinumInfo, operatorInfo] = await Promise.all([
          prisma.agentInfo.upsert({
            where: { id: golden.id },
            update: {
              percentage: goldenPercentage,
              amount: goldenAmount,
            },
            create: {
              id: golden.id,
              percentage: goldenPercentage,
              amount: goldenAmount,
            },
          }),
          prisma.agentInfo.upsert({
            where: { id: platinum.id },
            update: {
              percentage: platinumPercentage,
              amount: platinumAmount,
            },
            create: {
              id: platinum.id,
              percentage: platinumPercentage,
              amount: platinumAmount,
            },
          }),
          prisma.agentInfo.upsert({
            where: { id: operator.id },
            update: {
              percentage: operatorPercentage,
              amount: operatorAmount,
            },
            create: {
              id: operator.id,
              percentage: operatorPercentage,
              amount: operatorAmount,
            },
          }),
        ]);

        await prisma.transactionCommissionSummary.create({
          data: {
            betId: transaction.betId,
            transactionId: transaction.transactionId,
            betAmount,
            payoutAmount: transaction.payoutAmount ?? 0,
            refundAmount: transaction.refundAmount ?? 0,
            depositAmount: transaction.depositAmount ?? 0,
            withdrawAmount: transaction.withdrawAmount ?? 0,
            siteId: transaction.siteId,
            agentGoldenId: goldenInfo.id,
            agentPlatinumId: platinumInfo.id,
            agentOperatorId: operatorInfo.id,
            transactionType: transaction.transactionType,
            settled: transaction.settled === "Y",
            commissionId: "",
            category: categoryName,
            categoryId: categoryId,
          },
        });

        results.push({
          betId: transaction.betId,
          transactionId: transaction.transactionId,
          betAmount,
          category: categoryName,
          agentCommissions: {
            golden: {
              id: goldenInfo.id,
              percentage: goldenPercentage,
              amount: goldenAmount,
            },
            platinum: {
              id: platinumInfo.id,
              percentage: platinumPercentage,
              amount: platinumAmount,
            },
            operator: {
              id: operatorInfo.id,
              percentage: operatorPercentage,
              amount: operatorAmount,
            },
          },
          message: "Transaction summary created successfully",
        });
      } catch (error) {
        console.error(
          "Error processing transaction:",
          transaction.transactionId,
          error
        );
        // Optionally, push error info to results
        results.push({
          transactionId: transaction.transactionId,
          error: error.message,
        });
      }
    }

    return results;
  }

  public async getCategoryTransaction(
    category: string,
    agent: "gold" | "platinum" | "operator"
  ) {
    try {
      let include: any = {};
      let selectField: string;

      switch (agent) {
        case "gold":
          include.agentGolden = true;
          selectField = "agentGoldenId";
          break;
        case "platinum":
          include.agentPlatinum = true;
          selectField = "agentPlatinumId";
          break;
        case "operator":
          include.agentOperator = true;
          selectField = "agentOperatorId";
          break;
        default:
          throw new Error(
            "Invalid agent type. Use: gold | platinum | operator"
          );
      }

      const transactions = await prisma.transactionCommissionSummary.findMany({
        where: {
          category,
          NOT: {
            [selectField]: "",
          },
        },
        include,
      });

      return transactions;
    } catch (error) {
      throw new Error(`Error fetching grouped commissions: ${error.message}`);
    }
  }
}

export default UserDao;
