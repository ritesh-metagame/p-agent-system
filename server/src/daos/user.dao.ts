import {prisma} from "../server";
import type {User} from "../../prisma/generated/prisma";
import {DEFAULT_COMMISSION_COMPUTATION_PERIOD, UserRole} from "../common/config/constants";
import {CommissionService} from "../services/commission.service";
import {endOfMonth} from "date-fns";

class UserDao {
    constructor() {
    }

    public async getUserByUserId(userId: string) {
        try {
            const user = await prisma.user.findUnique({
                where: {id: userId},
                include: {role: true, commissionSummaries: true},
            });


            return user;
        } catch (error) {
            throw new Error(`Error fetching user: ${error}`);
        }
    }

    public async getUserPayoutAndWalletBalance(userId: string) {
        try {

            const eGamesCycle = await this.getPreviousCompletedCycleDates("E-Games");
            const sportsCycle =
                await this.getPreviousCompletedCycleDates("Sports Betting");

            const user = await prisma.user.findUnique({
                where: {id: userId},
                select: {
                    parentId: true,
                    role: {
                        select: {
                            name: true,
                        },
                    },
                },
            });

            if (!user) {
                console.warn(`⚠️ User not found: ${userId}`);
                return {payout: 0, wallet: 0};
            }

            const roleName = user.role.name;

            let targetUserIds = [];
            let platinumGroups = [];


            if (roleName === UserRole.OPERATOR) {
                // Fetch Platinum Users under Operator
                const platinumUsers = await prisma.user.findMany({
                    where: {
                        parentId: userId,

                    },
                    select: {id: true},
                });
                for (const platinum of platinumUsers) {
                    // Fetch Golden Users under this Platinum
                    const goldenUser = await prisma.user.findMany({
                        where: {parentId: platinum.id},
                        select: {id: true},
                    });
                    const goldenId = goldenUser.map(g => g.id);

                    // Each group contains Platinum + its Goldens
                    platinumGroups.push({
                        platinumId: platinum.id,
                        downlineIds: [platinum.id, ...goldenId],
                    });
                }


                const platinumIds = platinumUsers.map(u => u.id);

                // Fetch Golden Users under each Platinum User
                const goldenUsers = await prisma.user.findMany({
                    where: {
                        parentId: {in: platinumIds},
                    },
                    select: {id: true},
                });

                const goldenIds = goldenUsers.map(u => u.id);

                // Total downline (platinum + golden)
                targetUserIds = [...platinumIds, ...goldenIds];


            } else if (roleName === UserRole.PLATINUM) {
                // Platinum can see only its direct golden users
                const goldenUsers = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                    },
                    select: {id: true},
                });

                targetUserIds = goldenUsers.map(u => u.id);
                const goldenIds = goldenUsers.map(g => g.id);

                platinumGroups.push({
                    platinumId: userId,  // Treat Platinum as its own "group"
                    downlineIds: [userId, ...goldenIds],
                });


            }

            // Step 1: Fetch all commission summary records for this user
            const walletSummaries = await prisma.settlementHistory.findMany({
                where: {
                    userId,
                    categoryName: {
                        in: ['E-Games', 'Sports Betting', 'Speciality Games - RNG', 'Speciality Games - Tote']
                    },
                    isPartiallySettled: false,
                    amount: { // replace 'amount' with your actual numeric field
                        gt: 0 // "greater than 0" means only positive numbers
                    }
                }
            });
          

            // Step 1: Fetch all commission summary records for this user
            const summaries = await prisma.commissionSummary.findMany({
                  where: {
                      userId,
                      OR: [
                          {
                              categoryName: { in: ['E-Games', 'Speciality Games - RNG'] },
                              createdAt: roleName === UserRole.GOLDEN
                                  ? {
                                      gte: eGamesCycle.cycleStartDate,
                                      lte: eGamesCycle.cycleEndDate,
                                  }
                                  : {
                                      lte: eGamesCycle.cycleEndDate,
                                  },
                          },
                          {
                              categoryName: { in: ['Sports Betting', 'Speciality Games - Tote'] },
                              createdAt: roleName === UserRole.GOLDEN
                                  ? {
                                      gte: sportsCycle.cycleStartDate,
                                      lte: sportsCycle.cycleEndDate,
                                  }
                                  : {
                                      lte: sportsCycle.cycleEndDate,
                                  },
                          },
                      ],
                  },
              });



            if (!summaries.length) {
                console.warn(`⚠️ No commission summaries found for user: ${userId}`);
                return {payout: 0, wallet: 0};
            }

            const payoutSummaries = await prisma.commissionSummary.findMany({
                where: {
                    settledStatus: 'N',
                    userId: {in: targetUserIds},
                    ...(roleName === UserRole.OPERATOR ? {settledByOperator: false} : {}),
                    OR: [
                        {
                            categoryName: { in: ['E-Games', 'Speciality Games - RNG'] },
                            createdAt: roleName === UserRole.GOLDEN
                                  ? {
                                      gte: sportsCycle.cycleStartDate,
                                      lte: sportsCycle.cycleEndDate,
                                  }
                                  : {
                                      lte: sportsCycle.cycleEndDate,
                                  },
                        },
                        {
                            categoryName: { in: ['Sports Betting', 'Speciality Games - Tote'] },
                            createdAt: roleName === UserRole.GOLDEN
                                  ? {
                                      gte: sportsCycle.cycleStartDate,
                                      lte: sportsCycle.cycleEndDate,
                                  }
                                  : {
                                      lte: sportsCycle.cycleEndDate,
                                  },
                        },
                    ],
                },
            });


            // Step 3: Role-based settlement check
            const isSettled =
                roleName === UserRole.OPERATOR
                    ? summaries.every((s) => s.settledBySuperadmin)
                    : roleName === UserRole.PLATINUM
                        ? summaries.every((s) => s.settledByOperator)
                        : roleName === UserRole.GOLDEN
                            ? summaries.every((s) => s.settledByPlatinum)
                            : true; // default true for other roles

            console.log(
                `Role0000000000000ooooooooooooooooookkkkkkkkkkkkkkkkkkkkkkknnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn: ${roleName}, Settled: ${isSettled}, Summaries Count: ${summaries.length}`)

            if (!isSettled) {
                console.warn(
                    `⚠️ Settlement not completed for role ${roleName}. Returning payout and wallet as 0.`
                );
                return {payout: 0, wallet: 0};
            }


            // Step 5: Initialize sums

            let totalCommissionByUser = 0;

            let wallet = 0;
          let totalPayout = 0;
          
          console.log(`Total Payout for User------ ${userId}: ${walletSummaries}`);

            for (const summary of walletSummaries) {
                if (summary.categoryName === "E-Games") {
                    totalCommissionByUser += Number(summary.amount || 0);
                } else if (summary.categoryName === "Sports Betting") {
                    totalCommissionByUser += Number(summary.amount || 0);
                } else if (summary.categoryName === "Speciality Games - RNG") {
                    totalCommissionByUser += Number(summary.amount || 0);
                } else if (summary.categoryName === "Speciality Games - Tote") {
                    totalCommissionByUser += Number(summary.amount || 0);
                }


            }
            for (const group of platinumGroups) {
                const groupSummaries = payoutSummaries.filter(summary =>
                    group.downlineIds.includes(summary.userId)
                );

              let eGamesSum = 0;
              let specialityGamesRNGSum = 0;
              let sportsSum = 0;
              let specialityGamesToteSum = 0;

                for (const summary of groupSummaries) {
                    const payout = Number(summary.netCommissionAvailablePayout || 0);

                    if (summary.categoryName === 'E-Games') {
                        eGamesSum += payout;
                    } else if (summary.categoryName === 'Sports Betting') {
                        sportsSum += payout;
                    } else if (summary.categoryName === 'Speciality Games - RNG') {
                        specialityGamesRNGSum += payout;
                    } else if (summary.categoryName === 'Speciality Games - Tote') {
                        specialityGamesToteSum += payout;
                    }
                }
                // If category sums are negative, treat them as 0 individually
                if (eGamesSum < 0) eGamesSum = 0;
              if (sportsSum < 0) sportsSum = 0;
              if (specialityGamesRNGSum < 0) specialityGamesRNGSum = 0;
              if (specialityGamesToteSum < 0) specialityGamesToteSum = 0;

                // Now add corrected values
                const groupTotal = eGamesSum + sportsSum + specialityGamesRNGSum + specialityGamesToteSum;

                console.log(`Platinum ${group.platinumId}: E-Games = ${eGamesSum}, Sports = ${sportsSum}`);

                totalPayout += groupTotal;

                console.log(`Total Payout for Platinum ${group.platinumId}: ${totalPayout}`);
            }


            //   for (const summary of payoutSummaries) {
            //   if (summary.categoryName === "E-Games") {
            //     totalPayout += Number(summary.netCommissionAvailablePayout || 0);
            //   } else if (summary.categoryName === "Sports Betting") {
            //     totalPayout += Number(summary.netCommissionAvailablePayout || 0);
            //   }


            // }


            const payout =
                totalPayout;


            if (roleName === UserRole.GOLDEN) {
                wallet = totalCommissionByUser;
                // wallet = totalCommissionByUser - totalPaymentGatewayFee;
            } else {
                wallet = totalCommissionByUser;
            }

            return {
                payout,
                wallet,
            };
        } catch (err) {
            console.error("🔥 Error calculating payout and wallet:", err);
            throw err;
        }
    }

    public async getUserByUsername(username: string) {
        try {
            const user = await prisma.user.findUnique({
                where: {username},
                include: {role: true},
            });


            return user;
        } catch (error) {
            throw new Error(`Error fetching user: ${error}`);
        }
    }

    public async createUser({...data}: Record<string, any>): Promise<User> {
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
                where: {parentId, approved: 1},
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
                    id: {in: commissionIds},
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
                    // betId: true,
                    // settlementTime: true,
                    // timeOfBet: true,
                    // outletId: true,
                    // playerId: true,
                    playerName: true,
                    transactionId: true,
                    // gameId: true,
                    // gameName: true,
                    // gameType: true,
                    // gameProvider: true,
                    // machineId: true,
                    betAmount: true,
                    payoutAmount: true,
                    refundAmount: true,
                    // depositAmount: true,
                    // withdrawAmount: true,
                    // jackpotContribution: true,
                    // jackpotPayout: true,
                    // seedContriAmount: true,
                    // jackpotType: true,
                    // jackpotDetails: true,
                    // channelType: true,
                    // brand: true,
                    // sport: true,
                    // ticketStatus: true,
                    // prematchLive: true,
                    // kioskTerminal: true,
                    // platformCode: true,
                    // platformName: true,
                    // gameStatusId: true,
                    // roundId: true,
                    // siteId: true,
                    // agentAdminId: true,
                    // agentAdminName: true,
                    // agentOwnerId: true,
                    // agentOwnerName: true,
                    // agentMasterId: true,
                    // agentMasterName: true,
                    // agentGoldenId: true,
                    // agentGoldenName: true,
                    // agentUserType: true,
                    // ownerActualPercentage: true,
                    // ownerPercentage: true,
                    // masterAgentPercentage: true,
                    // goldenAgentPercentage: true,
                    // ggrAmount: true,
                    // totalCommission: true,
                    // ownerCommission: true,
                    // masterAgentCommission: true,
                    // goldenAgentCommission: true,
                    // depositCommission: true,
                    // withdrawCommission: true,
                    // transactionType: true,
                    // status: true,
                    settled: true,
                    // timestamp: true,
                    // createdAt: true,
                    updatedAt: true,

                    // ✅ User hierarchy with commissions
                    // agentGolden: {
                    //   select: {
                    //     id: true,
                    //     username: true,
                    //     role: true,
                    //     commissions: {
                    //       select: {
                    //         category: true,
                    //         commissionPercentage: true,
                    //       },
                    //     },
                    //     parent: {
                    //       select: {
                    //         id: true,
                    //         username: true,
                    //         role: true,
                    //         commissions: {
                    //           select: {
                    //             category: true,
                    //             commissionPercentage: true,
                    //           },
                    //         },
                    //         parent: {
                    //           select: {
                    //             id: true,
                    //             username: true,
                    //             role: true,
                    //             commissions: {
                    //               select: {
                    //                 category: true,
                    //                 commissionPercentage: true,
                    //               },
                    //             },
                    //           },
                    //         },
                    //       },
                    //     },
                    //   },
                    // },
                },
            });
            const res = await this.createTransactionSummary(transactions);
            return res;
        } catch (error) {
            throw new Error(`Error fetching all transactions: ${error}`);
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

    public async createTransactionSummary(transactions: any[]) {
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

                const category = golden.commissions[1].category;
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
                        where: {id: golden.id},
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
                        where: {id: platinum.id},
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
                        where: {id: operator.id},
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

    public async getCategoryTransaction(category: string, agent: UserRole) {
        try {
            let include: any = {};
            let selectField: string;

            switch (agent) {
                case UserRole.GOLDEN:
                    include.agentGolden = true;
                    selectField = "agentGoldenId";
                    break;
                case UserRole.PLATINUM:
                    include.agentPlatinum = true;
                    selectField = "agentPlatinumId";
                    break;
                case UserRole.OPERATOR:
                    include.agentOperator = true;
                    selectField = "agentOperatorId";
                    break;
                default:
                    throw new Error(
                        "Invalid agent type. Use: golden | platinum | operator"
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

    public async getUserDetailsWithCommissions(userId: string) {
        try {
            const user = await prisma.user.findUnique({
                where: {id: userId},
                include: {
                    role: true,
                    userSites: {
                        include: {
                            site: true,
                        },
                    },
                    commissions: {
                        include: {
                            site: true,
                            category: true,
                            role: true,
                        },
                    },
                    parent: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                    children: {
                        include: {
                            role: true,
                            commissions: {
                                include: {
                                    category: true,
                                    site: true,
                                },
                            },
                        },
                    },
                    commissionSummaries: {
                        include: {
                            // category: true,
                            Site: true,
                        },
                    },
                },
            });

            if (!user) {
                return null;
            }

            // Get commission totals
            const commissionTotals = await prisma.commissionSummary.aggregate({
                where: {userId},
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

            // Get pending vs settled commissions
            const commissionSummaries = await prisma.commissionSummary.groupBy({
                by: ["settledStatus"],
                where: {userId},
                _sum: {
                    netCommissionAvailablePayout: true,
                },
            });

            const pendingAmount =
                commissionSummaries.find((s) => s.settledStatus === "pending")?._sum
                    .netCommissionAvailablePayout || 0;
            const settledAmount =
                commissionSummaries.find((s) => s.settledStatus === "settled")?._sum
                    .netCommissionAvailablePayout || 0;

            return {
                user,
                commissionTotals: commissionTotals._sum,
                commissionStatus: {
                    pending: pendingAmount,
                    settled: settledAmount,
                    total: pendingAmount + settledAmount,
                },
            };
        } catch (error) {
            throw new Error(`Error fetching user details: ${error}`);
        }
    }

    public async getUserDetailsWithCommissionsByUsername(username: string) {
        try {
            const user = await prisma.user.findUnique({
                where: {username},
                include: {
                    role: true,
                    userSites: {
                        include: {
                            site: true,
                        },
                    },
                    commissions: {
                        include: {
                            site: true,
                            category: true,
                            role: true,
                        },
                    },
                    parent: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                    children: {
                        include: {
                            role: true,
                            commissions: {
                                include: {
                                    category: true,
                                    site: true,
                                },
                            },
                        },
                    },
                    commissionSummaries: {
                        include: {
                            // category: true,
                            Site: true,
                        },
                    },
                },
            });

            if (!user) {
                return null;
            }

            // Get commission totals
            const commissionTotals = await prisma.commissionSummary.aggregate({
                where: {userId: user.id},
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

            // Get pending vs settled commissions
            const commissionSummaries = await prisma.commissionSummary.groupBy({
                by: ["settledStatus"],
                where: {userId: user.id},
                _sum: {
                    netCommissionAvailablePayout: true,
                },
            });

            const pendingAmount =
                commissionSummaries.find((s) => s.settledStatus === "pending")?._sum
                    .netCommissionAvailablePayout || 0;
            const settledAmount =
                commissionSummaries.find((s) => s.settledStatus === "settled")?._sum
                    .netCommissionAvailablePayout || 0;

            return {
                user,
                commissionTotals: commissionTotals._sum,
                commissionStatus: {
                    pending: pendingAmount,
                    settled: settledAmount,
                    total: pendingAmount + settledAmount,
                },
            };
        } catch (error) {
            throw new Error(`Error fetching user details: ${error}`);
        }
    }

    private getWeeklyCompletedCycleDates(currentDate: Date) {
        // Get today's day of the week (0 = Sunday, 1 = Monday, etc.)
        const today = currentDate.getDay();

        // Calculate the date of the most recent Sunday (end of the previous week)
        const daysToSubtract = today === 0 ? 7 : today; // If today is Sunday, get last week's Sunday
        const mostRecentSunday = new Date(currentDate);
        mostRecentSunday.setDate(currentDate.getDate() - daysToSubtract);

        // Set hours to end of day
        mostRecentSunday.setHours(23, 59, 59, 999);

        // Calculate the start of that week (Monday)
        const startOfPrevWeek = new Date(mostRecentSunday);
        startOfPrevWeek.setDate(mostRecentSunday.getDate() - 6);
        startOfPrevWeek.setHours(0, 0, 0, 0);

        return {
            cycleStartDate: startOfPrevWeek,
            cycleEndDate: new Date(mostRecentSunday.setHours(23, 59, 59, 999)),
        };
    }

    private async getPreviousCompletedCycleDates(categoryName?: string) {
        const currentDate = new Date();

        // If in test mode, return dates from 1 month back
        if (process.env.VIEW_MODE === "test") {
            const oneMonthAgo = new Date(currentDate);
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 8);
            return {
                cycleStartDate: oneMonthAgo,
                cycleEndDate: currentDate,
            };
        }

        // For weekly computation categories (Sports Betting and Speciality Games - Tote)
        if (
            categoryName === "Sports Betting" ||
            categoryName === "Speciality Games - Tote"
        ) {
            return this.getWeeklyCompletedCycleDates(currentDate);
        }

        // For bi-monthly computation categories (default, E-Sports and Speciality Games - RNG)
        // Production mode - use cycle-based dates
        const currentDay = currentDate.getDate();
        let cycleStartDate: Date;
        let cycleEndDate: Date;

        if (DEFAULT_COMMISSION_COMPUTATION_PERIOD.toString() === "MONTHLY") {
            const prevMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - 1,
                1
            );
            cycleStartDate = new Date(
                prevMonth.getFullYear(),
                prevMonth.getMonth(),
                1
            );
            cycleEndDate = endOfMonth(prevMonth);
        } else {
            if (currentDay >= 16) {
                // We're in the second half, show first half of current month
                cycleStartDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    1
                );
                cycleEndDate = new Date(
                    new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        15
                    ).setHours(23, 59, 59, 999)
                );
            } else {
                // We're in first half, show second half of previous month
                cycleStartDate = new Date(
                    new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1,
                        16
                    ).setHours(0, 0, 0, 0)
                );
                cycleEndDate = new Date(
                    endOfMonth(
                        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
                    ).setHours(23, 59, 59, 999)
                );
            }
        }

        return {cycleStartDate, cycleEndDate};
    }
}

export default UserDao;
