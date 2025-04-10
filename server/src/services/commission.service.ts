import { Service } from "typedi";
import { Commission, User } from "../../prisma/generated/prisma";
import { CommissionDao } from "../daos/commission.dao";
import { RoleDao } from "../daos/role.dao";
import { GenerateCommission } from "../daos/generateCommission";
import { prisma } from "../server";

@Service()
class CommissionService {
  private commissionDao: CommissionDao;
  private roleDao: RoleDao;
  private commissionSummaryDao: GenerateCommission; // Assuming you have a CommissionSummaryDao

  constructor() {
    this.commissionDao = new CommissionDao();
    this.roleDao = new RoleDao();
    this.commissionSummaryDao = new GenerateCommission(); // Initialize the commission summary DAO
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

  public async createCommissionCategory(date: string) {
    try {
      // Using the instance variable instead of creating a new instance
      const newCommission =
        await this.commissionSummaryDao.generateCommissionSummaries(date);
      return newCommission;
    } catch (error) {
      throw new Error(`Error creating commission: ${error}`);
    }
  }

  public async getCommissionSummaries(user: {
    id: string;
    role: { name: string };
  }) {
    try {
      const roleName = user.role.name.toLowerCase();
      let summaries;

      // Fetch summaries based on role
      if (roleName === "superadmin") {
        summaries = await this.commissionDao.getSuperAdminCommissionSummaries();
      } else if (roleName === "operator") {
        summaries = await this.commissionDao.getOperatorCommissionSummaries(
          user.id
        );
      } else if (roleName === "platinum") {
        summaries = await this.commissionDao.getPlatinumCommissionSummaries(
          user.id
        );
      } else {
        summaries = await this.commissionDao.getCommissionSummariesForUser(
          user.id
        );
      }

      // Transform and group the data
      const groupedSummaries = summaries.reduce(
        (acc, summary) => {
          const platform = summary.category.name;
          const role = summary.role.name.toLowerCase();

          if (!acc[platform]) {
            acc[platform] = {};
          }

          if (roleName === "superadmin") {
            // For superadmin, group all operators together
            if (!acc[platform]["ALL OPERATORS"]) {
              acc[platform]["ALL OPERATORS"] = {
                totalDeposit: 0,
                totalWithdrawals: 0,
                totalBetAmount: 0,
                netGGR: 0,
                grossCommission: 0,
                netCommissionAvailablePayout: 0,
                operators: [],
              };
            }

            if (role === "operator") {
              acc[platform]["ALL OPERATORS"].operators.push({
                user: {
                  id: summary.user.id,
                  username: summary.user.username,
                  firstName: summary.user.firstName,
                  lastName: summary.user.lastName,
                },
                totalDeposit: summary.totalDeposit,
                totalWithdrawals: summary.totalWithdrawals,
                totalBetAmount: summary.totalBetAmount,
                netGGR: summary.netGGR,
                grossCommission: summary.grossCommission,
                netCommissionAvailablePayout:
                  summary.netCommissionAvailablePayout,
              });

              // Add to totals
              acc[platform]["ALL OPERATORS"].totalDeposit +=
                summary.totalDeposit;
              acc[platform]["ALL OPERATORS"].totalWithdrawals +=
                summary.totalWithdrawals;
              acc[platform]["ALL OPERATORS"].totalBetAmount +=
                summary.totalBetAmount;
              acc[platform]["ALL OPERATORS"].netGGR += summary.netGGR;
              acc[platform]["ALL OPERATORS"].grossCommission +=
                summary.grossCommission;
              acc[platform]["ALL OPERATORS"].netCommissionAvailablePayout +=
                summary.netCommissionAvailablePayout;
            }
          } else if (roleName === "operator") {
            // Initialize the ALL PLATINUMS group
            if (!acc[platform]["ALL PLATINUMS"]) {
              acc[platform]["ALL PLATINUMS"] = {
                totalDeposit: 0,
                totalWithdrawals: 0,
                totalBetAmount: 0,
                netGGR: 0,
                grossCommission: 0,
                netCommissionAvailablePayout: 0,
                platinums: [],
              };
            }

            // Add operator's own data
            if (role === "operator") {
              acc[platform]["operator"] = {
                user: {
                  id: summary.user.id,
                  username: summary.user.username,
                  firstName: summary.user.firstName,
                  lastName: summary.user.lastName,
                },
                totalDeposit: summary.totalDeposit,
                totalWithdrawals: summary.totalWithdrawals,
                totalBetAmount: summary.totalBetAmount,
                netGGR: summary.netGGR,
                grossCommission: summary.grossCommission,
                netCommissionAvailablePayout:
                  summary.netCommissionAvailablePayout,
              };
            } else if (role === "platinum") {
              // Add platinum data to ALL PLATINUMS and individual entry
              const platinumData = {
                user: {
                  id: summary.user.id,
                  username: summary.user.username,
                  firstName: summary.user.firstName,
                  lastName: summary.user.lastName,
                },
                totalDeposit: summary.totalDeposit,
                totalWithdrawals: summary.totalWithdrawals,
                totalBetAmount: summary.totalBetAmount,
                netGGR: summary.netGGR,
                grossCommission: summary.grossCommission,
                netCommissionAvailablePayout:
                  summary.netCommissionAvailablePayout,
                children: [],
              };

              acc[platform][summary.user.id] = platinumData;
              acc[platform]["ALL PLATINUMS"].platinums.push(platinumData);

              // Add to ALL PLATINUMS totals
              acc[platform]["ALL PLATINUMS"].totalDeposit +=
                summary.totalDeposit;
              acc[platform]["ALL PLATINUMS"].totalWithdrawals +=
                summary.totalWithdrawals;
              acc[platform]["ALL PLATINUMS"].totalBetAmount +=
                summary.totalBetAmount;
              acc[platform]["ALL PLATINUMS"].netGGR += summary.netGGR;
              acc[platform]["ALL PLATINUMS"].grossCommission +=
                summary.grossCommission;
              acc[platform]["ALL PLATINUMS"].netCommissionAvailablePayout +=
                summary.netCommissionAvailablePayout;
            } else if (role === "gold" && summary.user.parent) {
              // Add gold agents to their platinum parent's children array
              const platinumId = summary.user.parent.id;
              if (acc[platform][platinumId]) {
                acc[platform][platinumId].children.push({
                  user: {
                    id: summary.user.id,
                    username: summary.user.username,
                    firstName: summary.user.firstName,
                    lastName: summary.user.lastName,
                  },
                  totalDeposit: summary.totalDeposit,
                  totalWithdrawals: summary.totalWithdrawals,
                  totalBetAmount: summary.totalBetAmount,
                  netGGR: summary.netGGR,
                  grossCommission: summary.grossCommission,
                  netCommissionAvailablePayout:
                    summary.netCommissionAvailablePayout,
                });
              }
            }
          } else if (roleName === "platinum") {
            // Initialize the ALL GOLDS group
            if (!acc[platform]["ALL GOLDS"]) {
              acc[platform]["ALL GOLDS"] = {
                totalDeposit: 0,
                totalWithdrawals: 0,
                totalBetAmount: 0,
                netGGR: 0,
                grossCommission: 0,
                netCommissionAvailablePayout: 0,
                golds: [],
              };
            }

            if (role === "platinum") {
              // Add platinum's own data
              acc[platform]["platinum"] = {
                user: {
                  id: summary.user.id,
                  username: summary.user.username,
                  firstName: summary.user.firstName,
                  lastName: summary.user.lastName,
                },
                totalDeposit: summary.totalDeposit,
                totalWithdrawals: summary.totalWithdrawals,
                totalBetAmount: summary.totalBetAmount,
                netGGR: summary.netGGR,
                grossCommission: summary.grossCommission,
                netCommissionAvailablePayout:
                  summary.netCommissionAvailablePayout,
              };
            } else if (role === "gold") {
              // Add gold data to ALL GOLDS
              const goldData = {
                user: {
                  id: summary.user.id,
                  username: summary.user.username,
                  firstName: summary.user.firstName,
                  lastName: summary.user.lastName,
                },
                totalDeposit: summary.totalDeposit,
                totalWithdrawals: summary.totalWithdrawals,
                totalBetAmount: summary.totalBetAmount,
                netGGR: summary.netGGR,
                grossCommission: summary.grossCommission,
                netCommissionAvailablePayout:
                  summary.netCommissionAvailablePayout,
              };

              acc[platform]["ALL GOLDS"].golds.push(goldData);

              // Add to ALL GOLDS totals
              acc[platform]["ALL GOLDS"].totalDeposit += summary.totalDeposit;
              acc[platform]["ALL GOLDS"].totalWithdrawals +=
                summary.totalWithdrawals;
              acc[platform]["ALL GOLDS"].totalBetAmount +=
                summary.totalBetAmount;
              acc[platform]["ALL GOLDS"].netGGR += summary.netGGR;
              acc[platform]["ALL GOLDS"].grossCommission +=
                summary.grossCommission;
              acc[platform]["ALL GOLDS"].netCommissionAvailablePayout +=
                summary.netCommissionAvailablePayout;
            }
          } else {
            // For other roles, just show their own data
            acc[platform][role] = {
              user: {
                id: summary.user.id,
                username: summary.user.username,
                firstName: summary.user.firstName,
                lastName: summary.user.lastName,
              },
              totalDeposit: summary.totalDeposit,
              totalWithdrawals: summary.totalWithdrawals,
              totalBetAmount: summary.totalBetAmount,
              netGGR: summary.netGGR,
              grossCommission: summary.grossCommission,
              netCommissionAvailablePayout:
                summary.netCommissionAvailablePayout,
            };
          }

          return acc;
        },
        {} as Record<string, Record<string, any>>
      );

      return groupedSummaries;
    } catch (error) {
      throw new Error(`Error getting commission summaries: ${error}`);
    }
  }

  public async getCommissionPayoutReport(categoryId?: string) {
    try {
      interface CommissionMetrics {
        metric: string;
        pendingSettlement: number;
        allTime: number;
      }

      interface SummaryTotal {
        totalDeposit: number;
        totalWithdrawals: number;
        totalBetAmount: number;
        netGGR: number;
        grossCommission: number;
        paymentGatewayFee: number;
        netCommissionAvailablePayout: number;
      }

      const { pendingSettlements, allTimeData, categories, periodInfo } =
        await this.commissionDao.getCommissionPayoutReport(categoryId);

      const initialTotal: SummaryTotal = {
        totalDeposit: 0,
        totalWithdrawals: 0,
        totalBetAmount: 0,
        netGGR: 0,
        grossCommission: 0,
        paymentGatewayFee: 0,
        netCommissionAvailablePayout: 0,
      };

      const pendingPeriod = {
        start: periodInfo.startDate.toISOString().split("T")[0],
        end: periodInfo.endDate.toISOString().split("T")[0],
      };

      const response = {
        columns: [
          "",
          "Amount based on latest completed commission periods pending settlement",
          "All Time",
        ],
        periodInfo: {
          pendingPeriod,
        },
        overview: [] as CommissionMetrics[],
        breakdownPerGame: {} as Record<string, CommissionMetrics[]>,
      };

      // Calculate totals for pending settlements
      const pendingTotal = pendingSettlements.reduce<SummaryTotal>(
        (acc, curr) => ({
          totalDeposit: acc.totalDeposit + (curr._sum?.totalDeposit || 0),
          totalWithdrawals:
            acc.totalWithdrawals + (curr._sum?.totalWithdrawals || 0),
          totalBetAmount: acc.totalBetAmount + (curr._sum?.totalBetAmount || 0),
          netGGR: acc.netGGR + (curr._sum?.netGGR || 0),
          grossCommission:
            acc.grossCommission + (curr._sum?.grossCommission || 0),
          paymentGatewayFee:
            acc.paymentGatewayFee + (curr._sum?.paymentGatewayFee || 0),
          netCommissionAvailablePayout:
            acc.netCommissionAvailablePayout +
            (curr._sum?.netCommissionAvailablePayout || 0),
        }),
        initialTotal
      );

      // Calculate all-time totals
      const allTimeTotal = allTimeData.reduce<SummaryTotal>(
        (acc, curr) => ({
          totalDeposit: acc.totalDeposit + (curr._sum?.totalDeposit || 0),
          totalWithdrawals:
            acc.totalWithdrawals + (curr._sum?.totalWithdrawals || 0),
          totalBetAmount: acc.totalBetAmount + (curr._sum?.totalBetAmount || 0),
          netGGR: acc.netGGR + (curr._sum?.netGGR || 0),
          grossCommission:
            acc.grossCommission + (curr._sum?.grossCommission || 0),
          paymentGatewayFee:
            acc.paymentGatewayFee + (curr._sum?.paymentGatewayFee || 0),
          netCommissionAvailablePayout:
            acc.netCommissionAvailablePayout +
            (curr._sum?.netCommissionAvailablePayout || 0),
        }),
        initialTotal
      );

      // Add overview metrics
      response.overview = [
        {
          metric: "Total Deposits",
          pendingSettlement: pendingTotal.totalDeposit,
          allTime: allTimeTotal.totalDeposit,
        },
        {
          metric: "Total Withdrawals",
          pendingSettlement: pendingTotal.totalWithdrawals,
          allTime: allTimeTotal.totalWithdrawals,
        },
        {
          metric: "Total Bet Amount (Turnover)",
          pendingSettlement: pendingTotal.totalBetAmount,
          allTime: allTimeTotal.totalBetAmount,
        },
        {
          metric: "Net GGR",
          pendingSettlement: pendingTotal.netGGR,
          allTime: allTimeTotal.netGGR,
        },
        {
          metric: "Gross Commission (% of Net GGR)",
          pendingSettlement: pendingTotal.grossCommission,
          allTime: allTimeTotal.grossCommission,
        },
        {
          metric: "Payment Gateway Fees",
          pendingSettlement: pendingTotal.paymentGatewayFee,
          allTime: allTimeTotal.paymentGatewayFee,
        },
        {
          metric: "Net Commission Available for Payout",
          pendingSettlement: pendingTotal.netCommissionAvailablePayout,
          allTime: allTimeTotal.netCommissionAvailablePayout,
        },
      ];

      // If no specific category was requested, include per-game breakdown
      if (!categoryId) {
        const gameCategories = ["eGames", "Sports-Betting"];
        const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
        const categoryIdMap = new Map(categories.map((c) => [c.name, c.id]));

        // Process each game category
        for (const categoryName of gameCategories) {
          const categoryId = categoryIdMap.get(categoryName);
          const pendingData = categoryId
            ? pendingSettlements.find((s) => s.categoryId === categoryId)?._sum
            : undefined;
          const allTimeDataForCategory = categoryId
            ? allTimeData.find((s) => s.categoryId === categoryId)?._sum
            : undefined;

          // Initialize each category with same metrics structure
          response.breakdownPerGame[categoryName] = [
            {
              metric: "Total Deposits",
              pendingSettlement: pendingData?.totalDeposit || 0,
              allTime: allTimeDataForCategory?.totalDeposit || 0,
            },
            {
              metric: "Total Withdrawals",
              pendingSettlement: pendingData?.totalWithdrawals || 0,
              allTime: allTimeDataForCategory?.totalWithdrawals || 0,
            },
            {
              metric: "Total Bet Amount (Turnover)",
              pendingSettlement: pendingData?.totalBetAmount || 0,
              allTime: allTimeDataForCategory?.totalBetAmount || 0,
            },
            {
              metric: "Net GGR",
              pendingSettlement: pendingData?.netGGR || 0,
              allTime: allTimeDataForCategory?.netGGR || 0,
            },
            {
              metric: "Gross Commission (% of Net GGR)",
              pendingSettlement: pendingData?.grossCommission || 0,
              allTime: allTimeDataForCategory?.grossCommission || 0,
            },
            {
              metric: "Payment Gateway Fees",
              pendingSettlement: pendingData?.paymentGatewayFee || 0,
              allTime: allTimeDataForCategory?.paymentGatewayFee || 0,
            },
            {
              metric: "Net Commission Available for Payout",
              pendingSettlement: pendingData?.netCommissionAvailablePayout || 0,
              allTime:
                allTimeDataForCategory?.netCommissionAvailablePayout || 0,
            },
          ];
        }
      }

      return response;
    } catch (error) {
      throw new Error(`Error generating commission payout report: ${error}`);
    }
  }

  public async getRunningTally(
    userId: string,
    userRole: string,
    timestamp: Date
  ) {
    try {
      // Get start of current month
      const startDate = new Date(
        timestamp.getFullYear(),
        timestamp.getMonth(),
        1
      );

      // Get all commission records based on role
      let commissionSummaries;

      switch (userRole) {
        case "superadmin":
          // Get all operators' summaries
          commissionSummaries = await prisma.commissionSummary.findMany({
            where: {
              createdAt: {
                gte: startDate,
                lte: timestamp,
              },
              role: {
                name: "operator",
              },
            },
            include: {
              user: true,
              role: true,
              category: true,
            },
          });
          break;

        case "operator":
          // Get direct platinum summaries
          commissionSummaries = await prisma.commissionSummary.findMany({
            where: {
              createdAt: {
                gte: startDate,
                lte: timestamp,
              },
              user: {
                parentId: userId,
                role: {
                  name: "platinum",
                },
              },
            },
            include: {
              user: true,
              role: true,
              category: true,
            },
          });
          break;

        case "platinum":
          // Get direct agent summaries
          commissionSummaries = await prisma.commissionSummary.findMany({
            where: {
              createdAt: {
                gte: startDate,
                lte: timestamp,
              },
              user: {
                parentId: userId,
                role: {
                  name: "gold",
                },
              },
            },
            include: {
              user: true,
              role: true,
              category: true,
            },
          });
          break;

        case "agent":
          // Get own summaries
          commissionSummaries = await prisma.commissionSummary.findMany({
            where: {
              createdAt: {
                gte: startDate,
                lte: timestamp,
              },
              userId: userId,
            },
            include: {
              user: true,
              role: true,
              category: true,
            },
          });
          break;

        default:
          throw new Error("Invalid role specified");
      }

      // Group summaries by game category
      const gameCategories = ["E-Games", "Sports-Betting"];
      const result = {
        columns: [
          "",
          "E-GAMES COMMISSION AS OF TODAY",
          "SPORTS BETTING COMMISSION AS OF TODAY",
        ],
        roleLabel: this.getRoleLabelForUser(userRole),
        tally: [
          {
            metric: "Net Commission Available for Payout",
            eGames: 0,
            sportsBetting: 0,
          },
        ],
        from: startDate.toISOString(),
        to: timestamp.toISOString(),
      };

      // Calculate totals for each game category
      commissionSummaries.forEach((summary) => {
        if (summary.category.name === "E-Games") {
          result.tally[0].eGames += Number(
            summary.netCommissionAvailablePayout || 0
          );
        } else if (summary.category.name === "Sports-Betting") {
          result.tally[0].sportsBetting += Number(
            summary.netCommissionAvailablePayout || 0
          );
        }
      });

      return result;
    } catch (error) {
      throw new Error(`Error getting running commission tally: ${error}`);
    }
  }

  private getRoleLabelForUser(role: string): string {
    switch (role.toLowerCase()) {
      case "superadmin":
        return "ALL OPERATORS";
      case "operator":
        return "ALL PLATINUMS";
      case "platinum":
        return "ALL AGENTS";
      case "agent":
        return "SELF";
      default:
        return "";
    }
  }
}

export { CommissionService };
