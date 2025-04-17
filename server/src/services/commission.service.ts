import { Service } from "typedi";
import { Commission, User } from "../../prisma/generated/prisma";
import { CommissionDao } from "../daos/commission.dao";
import { RoleDao } from "../daos/role.dao";
import { GenerateCommission } from "../daos/generateCommission";
import { prisma } from "../server";
import {
  CommissionComputationPeriod,
  DEFAULT_COMMISSION_COMPUTATION_PERIOD,
} from "../common/config/constants";

import {
  addDays,
  differenceInDays,
  endOfMonth,
  format,
  getDaysInMonth,
  lastDayOfMonth,
  setDate,
  startOfMonth,
  subMonths,
} from "date-fns";

interface SummaryTotal {
  totalDeposit: number;
  totalWithdrawals: number;
  totalBetAmount: number;
  netGGR: number;
  grossCommission: number;
  paymentGatewayFee: number;
  netCommissionAvailablePayout: number;
}

interface EGamesLicenseData {
  type: "egames";
  ggr: { pending: number; allTime: number };
  commission: { pending: number; allTime: number };
  commissionRate: number;
}

interface SportsBettingLicenseData {
  type: "sports";
  betAmount: { pending: number; allTime: number };
  commission: { pending: number; allTime: number };
  commissionRate: number;
}

interface SpecialityGamesToteLicenseData {
  type: "specialityGamesTote";
  betAmount: { pending: number; allTime: number };
  commission: { pending: number; allTime: number };
  commissionRate: number;
}

interface SpecialityGamesRNGLicenseData {
  type: "specialityGamesRNG";
  ggr: { pending: number; allTime: number };
  commission: { pending: number; allTime: number };
  commissionRate: number;
}

type LicenseData =
  | EGamesLicenseData
  | SportsBettingLicenseData
  | SpecialityGamesToteLicenseData
  | SpecialityGamesRNGLicenseData;

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
      const newDate = new Date(date);
      const newCommission =
        await this.commissionSummaryDao.generateCommissionSummariesByDate(
          newDate
        );
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

  public async getCommissionPayoutReport(userId: string, categoryId?: string) {
    try {
      // Calculate the date range for the previously completed cycle
      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      let cycleStartDate: Date;
      let cycleEndDate: Date;

      if (DEFAULT_COMMISSION_COMPUTATION_PERIOD.toString() === "MONTHLY") {
        // For monthly periods, show the previous complete month
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
        // For bi-monthly periods
        if (currentDay >= 16) {
          cycleStartDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          cycleEndDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            15,
            23,
            59,
            59,
            999
          );
        } else {
          const prevMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1
          );
          cycleStartDate = new Date(
            prevMonth.getFullYear(),
            prevMonth.getMonth(),
            16
          );
          cycleEndDate = endOfMonth(prevMonth);
        }
      }

      // Use UTC hours for consistent date comparison
      cycleStartDate.setUTCHours(0, 0, 0, 0);
      cycleEndDate.setUTCHours(23, 59, 59, 999);

      // Get user and role information
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user || !user.role) {
        throw new Error("User or role information not found");
      }

      const roleName = user.role.name.toLowerCase();
      const pendingPeriod = {
        start: format(cycleStartDate, "yyyy-MM-dd"),
        end: format(cycleEndDate, "yyyy-MM-dd"),
      };

      // Initialize array to store all relevant user IDs
      let userIds = [userId];

      // Fetch child users based on role hierarchy
      switch (roleName) {
        case "superadmin":
          // Get all operators
          const operators = await prisma.user.findMany({
            where: {
              role: {
                name: {
                  equals: "operator",
                },
              },
            },
            select: { id: true },
          });
          userIds = userIds.concat(operators.map((op) => op.id));
          break;

        case "operator":
          // Get all platinum users under this operator
          const platinums = await prisma.user.findMany({
            where: {
              parentId: userId,
              role: {
                name: {
                  equals: "platinum",
                },
              },
            },
            select: { id: true },
          });
          userIds = userIds.concat(platinums.map((p) => p.id));
          break;

        case "platinum":
          // Get all gold users under this platinum
          const golds = await prisma.user.findMany({
            where: {
              parentId: userId,
              role: {
                name: {
                  equals: "gold",
                },
              },
            },
            select: { id: true },
          });
          userIds = userIds.concat(golds.map((g) => g.id));
          break;
      }

      // Check if any data exists for these users
      const anyData = await prisma.commissionSummary.findFirst({
        where: {
          userId: {
            in: userIds,
          },
          createdAt: {
            gte: cycleStartDate,
            lte: cycleEndDate,
          },
        },
      });

      // If no data found, return empty report with message
      if (!anyData && userIds.length > 0) {
        return {
          columns: [
            "",
            "Amount based on latest completed commission periods pending settlement",
            "All Time",
          ],
          periodInfo: {
            pendingPeriod,
            noDataMessage: `No commission data available for this period (${pendingPeriod.start} to ${pendingPeriod.end})`,
          },
          overview: this.getEmptyOverview(),
        };
      }

      // Get commission data for all users
      const pendingSettlements = await prisma.commissionSummary.groupBy({
        by: ["categoryName"],
        where: {
          userId: { in: userIds },
          createdAt: {
            gte: cycleStartDate,
            lte: cycleEndDate,
          },
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

      // Get all-time data
      const allTimeData = await prisma.commissionSummary.groupBy({
        by: ["categoryName"],
        where: {
          userId: { in: userIds },
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

      return this.generateReportResponse(
        pendingSettlements,
        allTimeData,
        pendingPeriod,
        categoryId
      );
    } catch (error) {
      throw new Error(`Error generating commission payout report: ${error}`);
    }
  }

  private getEmptyOverview() {
    return [
      {
        metric: "Total Deposits",
        pendingSettlement: 0,
        allTime: 0,
      },
      {
        metric: "Total Withdrawals",
        pendingSettlement: 0,
        allTime: 0,
      },
      {
        metric: "Total Bet Amount (Turnover)",
        pendingSettlement: 0,
        allTime: 0,
      },
      {
        metric: "Net GGR",
        pendingSettlement: 0,
        allTime: 0,
      },
      {
        metric: "Gross Commission (% of Net GGR)",
        pendingSettlement: 0,
        allTime: 0,
      },
      {
        metric: "Payment Gateway Fees",
        pendingSettlement: 0,
        allTime: 0,
      },
      {
        metric: "Net Commission Available for Payout",
        pendingSettlement: 0,
        allTime: 0,
      },
    ];
  }

  private generateReportResponse(
    pendingSettlements: any[],
    allTimeData: any[],
    pendingPeriod: { start: string; end: string },
    categoryId?: string
  ) {
    const categories = prisma.category.findMany();
    const initialTotal = {
      totalDeposit: 0,
      totalWithdrawals: 0,
      totalBetAmount: 0,
      netGGR: 0,
      grossCommission: 0,
      paymentGatewayFee: 0,
      netCommissionAvailablePayout: 0,
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
      overview: [] as any[],
      breakdownPerGame: {} as Record<string, any[]>,
    };

    // Calculate totals for pending settlements and all time
    const pendingTotal = this.calculateTotals(pendingSettlements, initialTotal);
    const allTimeTotal = this.calculateTotals(allTimeData, initialTotal);

    // Generate overview metrics
    response.overview = this.generateOverviewMetrics(
      pendingTotal,
      allTimeTotal
    );

    // Generate per-game breakdown if no specific category was requested
    if (!categoryId) {
      response.breakdownPerGame = this.generateGameBreakdown(
        pendingSettlements,
        allTimeData,
        ["eGames", "Sports-Betting"]
      );
    }

    return response;
  }

  private calculateTotals(data: any[], initial: any) {
    return data.reduce(
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
      initial
    );
  }

  private generateOverviewMetrics(pendingTotal: any, allTimeTotal: any) {
    return [
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
  }

  private generateGameBreakdown(
    pendingSettlements: any[],
    allTimeData: any[],
    gameCategories: string[]
  ) {
    const breakdown: Record<string, any[]> = {};

    for (const categoryName of gameCategories) {
      const pendingData = pendingSettlements.find(
        (s) => s.categoryName.toLowerCase() === categoryName.toLowerCase()
      )?._sum;

      const allTimeDataForCategory = allTimeData.find(
        (s) => s.categoryName.toLowerCase() === categoryName.toLowerCase()
      )?._sum;

      breakdown[categoryName] = this.generateOverviewMetrics(
        pendingData || {},
        allTimeDataForCategory || {}
      );
    }

    return breakdown;
  }

  public async getRunningTally(
    userId: string,
    userRole: string,
    timestamp: Date
  ) {
    try {
      const currentDate = new Date(timestamp);
      const currentDay = currentDate.getDate();
      let startDate: Date;

      // Calculate the appropriate start date based on the commission computation period
      if (DEFAULT_COMMISSION_COMPUTATION_PERIOD.toString() === "MONTHLY") {
        // For monthly periods: start from 1st day of current month
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
      } else {
        // For bi-monthly periods
        if (currentDay >= 16) {
          // If we're in the second half of the month (16th onwards)
          // Start date is the 16th of the current month
          startDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            16
          );
        } else {
          // If we're in the first half of the month (1-15)
          // Start date is the 1st of the current month
          startDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
        }
      }

      console.log("Running tally date range:", {
        startDate: startDate.toISOString(),
        endDate: timestamp.toISOString(),
        currentDay,
        computationPeriod: DEFAULT_COMMISSION_COMPUTATION_PERIOD.toString(),
      });

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
            select: {
              netCommissionAvailablePayout: true,
              categoryName: true,
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

      console.log({ commissionSummaries });

      // Calculate totals for each game category
      commissionSummaries.forEach((summary) => {
        if (
          summary.categoryName.toLowerCase() === "egames" ||
          summary.categoryName.toLowerCase() === "e-games"
        ) {
          result.tally[0].eGames += Number(
            summary.netCommissionAvailablePayout || 0
          );
        } else if (summary.categoryName.toLowerCase() === "sports-betting") {
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

  // public async getTopPerformer(date: string) {
  //   try {
  //     // Using the instance variable instead of creating a new instance
  //     const newCommission =
  //       await this.commissionSummaryDao.generateTopPerformers(date);
  //     return newCommission;
  //   } catch (error) {
  //     throw new Error(`Error creating commission: ${error}`);
  //   }
  // }

  public async getTotalCommissionByUser(date: string) {
    try {
      // Using the instance variable instead of creating a new instance
      const newCommission =
        await this.commissionDao.getAllCommissionTransactionsByUser(date);
      return newCommission;
    } catch (error) {
      throw new Error(`Error creating commission: ${error}`);
    }
  }

  public async getTotalBreakdown(userId: string, roleName: string) {
    try {
      let userIds = [userId];
      roleName = roleName.toLowerCase();

      // Handle hierarchy based access
      if (roleName === "superadmin") {
        const operators = await prisma.user.findMany({
          where: {
            role: { name: "operator" },
          },
          select: { id: true },
        });
        userIds = operators.map((op) => op.id);
      } else if (roleName === "operator") {
        const platinums = await prisma.user.findMany({
          where: {
            parentId: userId,
            role: { name: "platinum" },
          },
          select: { id: true },
        });
        userIds = platinums.map((p) => p.id);
      } else if (roleName === "platinum") {
        const golds = await prisma.user.findMany({
          where: {
            parentId: userId,
            role: { name: "gold" },
          },
          select: { id: true },
        });
        userIds = golds.map((g) => g.id);
      }

      // Get pending settlements
      const pendingSettlements = await prisma.commissionSummary.groupBy({
        by: ["categoryName"],
        where: {
          userId: { in: userIds },
          settledStatus: "N",
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

      // Get all-time data
      const allTimeData = await prisma.commissionSummary.groupBy({
        by: ["categoryName"],
        where: {
          userId: { in: userIds },
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

      const response = {
        code: "2004",
        message: "Total Commission Payouts Breakdown fetched successfully",
        data: {
          columns: [
            "",
            "Amount based on latest completed commission periods pending settlement",
            "Settled All Time",
          ],
          overview: [] as any[],
        },
      };

      // Transform the data into the required format
      const metrics = [
        { name: "Total EGames", category: "egames" },
        { name: "Total Sports Betting", category: "sports-betting" },
        { name: "Total Specialty Games", category: "specialty" },
      ];

      // Calculate aggregates for each metric
      metrics.forEach((metric) => {
        const pending =
          pendingSettlements.find(
            (s) => s.categoryName.toLowerCase() === metric.category
          )?._sum?.netCommissionAvailablePayout || 0;

        const allTime =
          allTimeData.find(
            (s) => s.categoryName.toLowerCase() === metric.category
          )?._sum?.netCommissionAvailablePayout || 0;

        response.data.overview.push({
          metric: metric.name,
          pendingSettlement: pending,
          allTime: allTime,
        });
      });

      // Calculate gross commissions (sum of all categories)
      const grossPending = response.data.overview.reduce(
        (sum, item) => sum + item.pendingSettlement,
        0
      );
      const grossAllTime = response.data.overview.reduce(
        (sum, item) => sum + item.allTime,
        0
      );

      response.data.overview.push({
        metric: "Gross Commissions",
        pendingSettlement: grossPending,
        allTime: grossAllTime,
      });

      // Add payment gateway fees
      const pendingFees = pendingSettlements.reduce(
        (sum, item) => sum + (item._sum?.paymentGatewayFee || 0),
        0
      );
      const allTimeFees = allTimeData.reduce(
        (sum, item) => sum + (item._sum?.paymentGatewayFee || 0),
        0
      );

      response.data.overview.push({
        metric: "Less: Total Payment Gateway Fees",
        pendingSettlement: pendingFees,
        allTime: allTimeFees,
      });

      // Calculate net commission
      response.data.overview.push({
        metric: "Net Commission Available for Payout",
        pendingSettlement: grossPending - pendingFees,
        allTime: grossAllTime - allTimeFees,
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error generating total commission breakdown: ${error}`);
    }
  }

  public async getPaymentGatewayFeesBreakdown(
    userId: string,
    roleName: string
  ) {
    // Get all users under this user based on role hierarchy
    let userIds = [userId];

    if (roleName.toLowerCase() === "operator") {
      // Get all platinum and gold users under this operator
      const platinums = await prisma.user.findMany({
        where: {
          parentId: userId,
          role: { name: "platinum" },
        },
        select: { id: true },
      });
      userIds = [...userIds, ...platinums.map((p) => p.id)];

      // Get all gold users under these platinums
      const golds = await prisma.user.findMany({
        where: {
          parentId: { in: platinums.map((p) => p.id) },
          role: { name: "gold" },
        },
        select: { id: true },
      });
      userIds = [...userIds, ...golds.map((g) => g.id)];
    } else if (roleName.toLowerCase() === "platinum") {
      // Get all gold users under this platinum
      const golds = await prisma.user.findMany({
        where: {
          parentId: userId,
          role: { name: "gold" },
        },
        select: { id: true },
      });
      userIds = [...userIds, ...golds.map((g) => g.id)];
    }

    // Get fees from commission_summary where deposits and withdrawals are not null
    const summaries = await prisma.commissionSummary.findMany({
      where: {
        // userId: { in: userIds },
        NOT: {
          categoryName: {
            in: [
              "egames",
              "sports-betting",
              "eGames",
              "e-games",
              "sportsbet",
              "sports betting",
            ],
          },
        },
        OR: [{ totalDeposit: { gt: 0 } }, { totalWithdrawals: { gt: 0 } }],
        paymentGatewayFee: {
          gt: 0,
        },
      },
      select: {
        totalDeposit: true,
        totalWithdrawals: true,
        paymentGatewayFee: true,
      },
    });

    // console.log({ summaries });

    // Calculate total fees and transaction amounts
    const totals = summaries.reduce(
      (acc, curr) => ({
        totalDeposit: acc.totalDeposit + (curr.totalDeposit || 0),
        totalWithdrawals: acc.totalWithdrawals + (curr.totalWithdrawals || 0),
        totalFees: acc.totalFees + (curr.paymentGatewayFee || 0),
      }),
      {
        totalDeposit: 0,
        totalWithdrawals: 0,
        totalFees: 0,
      }
    );

    // Calculate proportional fees for deposits and withdrawals
    const totalTransactions = totals.totalDeposit + totals.totalWithdrawals;
    let depositFees = 0;
    let withdrawalFees = 0;

    if (totalTransactions > 0) {
      depositFees =
        totals.totalFees * (totals.totalDeposit / totalTransactions);
      withdrawalFees =
        totals.totalFees * (totals.totalWithdrawals / totalTransactions);
    }

    return {
      columns: ["", "Amount"],
      fees: [
        { type: "Deposit", amount: depositFees },
        { type: "Withdrawal", amount: withdrawalFees },
        { type: "Total Payment Gateway Fees", amount: totals.totalFees },
      ],
    };
  }

  public async getPendingSettlements(userId: string, roleName: string) {
    // Calculate the date range for the last completed cycle
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    let cycleStartDate: Date;
    let cycleEndDate: Date;

    // Set date range based on commission computation period
    if (DEFAULT_COMMISSION_COMPUTATION_PERIOD.toString() === "MONTHLY") {
      // For monthly periods, show the previous complete month
      const prevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );
      cycleStartDate = prevMonth;
      cycleEndDate = endOfMonth(prevMonth);
    } else {
      // For bi-monthly periods
      if (currentDay >= 16) {
        // We're in the second half (16-31), so show first half (1-15)
        cycleStartDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        cycleEndDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          15
        );
        cycleEndDate.setHours(23, 59, 59, 999);
      } else {
        // We're in first half (1-15), so show last month's second half (16-31)
        const prevMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        cycleStartDate = new Date(
          prevMonth.getFullYear(),
          prevMonth.getMonth(),
          16
        );
        cycleEndDate = endOfMonth(prevMonth);
      }
    }

    // Get user IDs based on role hierarchy
    let userIds: string[] = [];
    roleName = roleName.toLowerCase();

    if (roleName === "superadmin") {
      // Get all operators
      const operators = await prisma.user.findMany({
        where: {
          role: { name: "operator" },
        },
        select: { id: true },
      });
      userIds = operators.map((op) => op.id);
    } else if (roleName === "operator") {
      // Get all platinum users under this operator
      const platinums = await prisma.user.findMany({
        where: {
          parentId: userId,
          role: { name: "platinum" },
        },
        select: { id: true },
      });
      userIds = platinums.map((p) => p.id);
    } else {
      return {
        columns: [
          "Network",
          "Total Deposits",
          "Total Withdrawals",
          "Total Gross Commissions",
          "Less: Payment Gateway Fees",
          "Total Net Commissions for Settlement",
          "Breakdown",
          "Release Commissions",
        ],
        periodInfo: {
          start: format(cycleStartDate, "yyyy-MM-dd"),
          end: format(cycleEndDate, "yyyy-MM-dd"),
        },
        rows: [],
      };
    }

    // Get summaries for unsettled commissions in the completed cycle
    const commissionSummaries = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      include: {
        commissionSummaries: {
          where: {
            createdAt: {
              gte: cycleStartDate,
              lte: cycleEndDate,
            },
            settledStatus: "N",
          },
        },
      },
    });

    // Transform data into required format
    const rows = commissionSummaries.map((user) => {
      const summaries = user.commissionSummaries;
      const totalDeposits = summaries.reduce(
        (sum, s) => sum + (s.totalDeposit || 0),
        0
      );
      const totalWithdrawals = summaries.reduce(
        (sum, s) => sum + (s.totalWithdrawals || 0),
        0
      );
      const grossCommissions = summaries.reduce(
        (sum, s) => sum + (s.grossCommission || 0),
        0
      );
      const paymentGatewayFees = summaries.reduce(
        (sum, s) => sum + (s.paymentGatewayFee || 0),
        0
      );
      const netCommissions = summaries.reduce(
        (sum, s) => sum + (s.netCommissionAvailablePayout || 0),
        0
      );

      return {
        network: user.username || "Unknown",
        totalDeposits,
        totalWithdrawals,
        grossCommissions,
        paymentGatewayFees,
        netCommissions,
        breakdownAction: "view",
        releaseAction: "release_comms",
      };
    });

    return {
      columns: [
        "Network",
        "Total Deposits",
        "Total Withdrawals",
        "Total Gross Commissions",
        "Less: Payment Gateway Fees",
        "Total Net Commissions for Settlement",
        "Breakdown",
        "Release Commissions",
      ],
      periodInfo: {
        start: format(cycleStartDate, "yyyy-MM-dd"),
        end: format(cycleEndDate, "yyyy-MM-dd"),
      },
      rows: rows,
    };
  }

  public async getOperatorBreakdown(userId: string) {
    try {
      // Calculate the date range for the previous completed cycle
      const { cycleStartDate, cycleEndDate } =
        await this.getPreviousCompletedCycleDates();

      const operators = await prisma.commissionSummary.findMany({
        where: {
          createdAt: {
            gte: cycleStartDate,
            lte: cycleEndDate,
          },
          settledStatus: "N",
          role: {
            name: "operator",
          },
        },
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const rows = operators.map((op) => ({
        network: op.user.username,
        name: `${op.user.firstName} ${op.user.lastName}`,
        egamesCommission: op.categoryName.toLowerCase().includes("egames")
          ? op.grossCommission
          : 0,
        sportsCommission: op.categoryName.toLowerCase().includes("sports")
          ? op.grossCommission
          : 0,
        netCommission: op.netCommissionAvailablePayout,
      }));

      return {
        code: "2007",
        message: "Operator Commission Breakdown fetched successfully",
        data: {
          columns: [
            "Network",
            "Name",
            "Total EGames Gross Commissions",
            "Total Sports Gross Commissions",
            "Total Net Commissions",
          ],
          rows,
        },
      };
    } catch (error) {
      throw new Error(`Error getting operator breakdown: ${error}`);
    }
  }

  public async getPlatinumBreakdown(operatorId: string) {
    try {
      const { cycleStartDate, cycleEndDate } =
        await this.getPreviousCompletedCycleDates();

      const platinums = await prisma.commissionSummary.findMany({
        where: {
          createdAt: {
            gte: cycleStartDate,
            lte: cycleEndDate,
          },
          settledStatus: "N",
          role: {
            name: "platinum",
          },
          user: {
            parentId: operatorId,
          },
        },
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const rows = platinums.map((plat) => ({
        network: plat.user.username,
        name: `${plat.user.firstName} ${plat.user.lastName}`,
        egamesCommission: plat.categoryName.toLowerCase().includes("egames")
          ? plat.grossCommission
          : 0,
        sportsCommission: plat.categoryName.toLowerCase().includes("sports")
          ? plat.grossCommission
          : 0,
        netCommission: plat.netCommissionAvailablePayout,
      }));

      // Add total row
      const totalRow = {
        network: "",
        name: "PLATINUM PARTNER TOTAL",
        egamesCommission: rows.reduce(
          (sum, row) => sum + row.egamesCommission,
          0
        ),
        sportsCommission: rows.reduce(
          (sum, row) => sum + row.sportsCommission,
          0
        ),
        netCommission: rows.reduce((sum, row) => sum + row.netCommission, 0),
      };
      rows.push(totalRow);

      return {
        code: "2008",
        message: "Platinum Partner Commission Breakdown fetched successfully",
        data: {
          columns: [
            "Network",
            "Name",
            "Total EGames Gross Commissions",
            "Total Sports Gross Commissions",
            "Total Net Commissions",
          ],
          rows,
        },
      };
    } catch (error) {
      throw new Error(`Error getting platinum breakdown: ${error}`);
    }
  }

  public async getGoldenBreakdown(platinumId: string) {
    try {
      const { cycleStartDate, cycleEndDate } =
        await this.getPreviousCompletedCycleDates();

      const goldens = await prisma.commissionSummary.findMany({
        where: {
          createdAt: {
            gte: cycleStartDate,
            lte: cycleEndDate,
          },
          settledStatus: "N",
          role: {
            name: "gold",
          },
          user: {
            parentId: platinumId,
          },
        },
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const rows = goldens.map((gold) => ({
        network: gold.user.username,
        name: `${gold.user.firstName} ${gold.user.lastName}`,
        egamesCommission: gold.categoryName.toLowerCase().includes("egames")
          ? gold.grossCommission
          : 0,
        sportsCommission: gold.categoryName.toLowerCase().includes("sports")
          ? gold.grossCommission
          : 0,
        paymentGatewayFee: gold.paymentGatewayFee,
        totalNetCommission: gold.netCommissionAvailablePayout,
        deductionsFromGross: gold.paymentGatewayFee,
        finalNetCommission: gold.netCommissionAvailablePayout,
      }));

      // Add total row
      const totalRow = {
        network: "",
        name: "GOLDEN PARTNER TOTAL",
        egamesCommission: rows.reduce(
          (sum, row) => sum + row.egamesCommission,
          0
        ),
        sportsCommission: rows.reduce(
          (sum, row) => sum + row.sportsCommission,
          0
        ),
        paymentGatewayFee: rows.reduce(
          (sum, row) => sum + row.paymentGatewayFee,
          0
        ),
        totalNetCommission: rows.reduce(
          (sum, row) => sum + row.totalNetCommission,
          0
        ),
        deductionsFromGross: rows.reduce(
          (sum, row) => sum + row.deductionsFromGross,
          0
        ),
        finalNetCommission: rows.reduce(
          (sum, row) => sum + row.finalNetCommission,
          0
        ),
        userId: "total", // Add userId for total row
        isHeader: true,
      };
      rows.push(totalRow);

      return {
        code: "2009",
        message: "Golden Partner Commission Breakdown fetched successfully",
        data: {
          columns: [
            "Network",
            "Name",
            "Total EGames Gross Commissions",
            "Total Sports Gross Commissions",
            "Less: Payment Gateway Fees",
            "Total Net Commissions",
            "Total Deductions",
            "Final Net Commission",
          ],
          rows,
        },
      };
    } catch (error) {
      throw new Error(`Error getting golden breakdown: ${error}`);
    }
  }

  // Helper method to get date range for previous completed cycle
  private async getPreviousCompletedCycleDates() {
    const currentDate = new Date();
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
          currentDate.getFullYear(),
          currentDate.getMonth(),
          15
        );
      } else {
        // We're in first half, show second half of previous month
        cycleStartDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          16
        );
        cycleEndDate = endOfMonth(
          new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
        );
      }
    }

    return { cycleStartDate, cycleEndDate };
  }

  public async getCommissionBreakdown(
    userId: string,
    role: string,
    startDate?: Date,
    endDate?: Date,
    targetUserId?: string
  ) {
    try {
      // Use provided date range or default to previous completed cycle
      let cycleStartDate: Date;
      let cycleEndDate: Date;

      if (startDate && endDate) {
        cycleStartDate = startDate;
        cycleEndDate = endDate;
      } else {
        const dates = await this.getPreviousCompletedCycleDates();
        cycleStartDate = dates.cycleStartDate;
        cycleEndDate = dates.cycleEndDate;
      }

      role = role.toLowerCase();
      let breakdownData;

      // First, if targetUserId is provided, get their role
      let targetRole = role;
      let effectiveUserId = userId;

      if (targetUserId) {
        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          include: { role: true },
        });

        if (!targetUser || !targetUser.role) {
          throw new Error("Target user not found or has no role");
        }

        targetRole = targetUser.role.name.toLowerCase();
        effectiveUserId = targetUserId;
      }

      // Determine which role's data to show based on the target role
      let childRole;
      switch (targetRole) {
        case "superadmin":
          childRole = "operator";
          break;
        case "operator":
          childRole = "platinum";
          break;
        case "platinum":
          childRole = "gold";
          break;
        default:
          throw new Error(`Invalid role: ${targetRole}`);
      }

      // Get the hierarchical data
      const data = await this.getHierarchicalBreakdown(
        childRole,
        effectiveUserId,
        cycleStartDate,
        cycleEndDate
      );

      // Set appropriate message based on the role
      let message;
      let code;
      switch (childRole) {
        case "operator":
          message = "Complete Commission Breakdown fetched successfully";
          code = "2007";
          break;
        case "platinum":
          message =
            "Platinum and Gold Partner Commission Breakdown fetched successfully";
          code = "2008";
          break;
        case "gold":
          message = "Golden Partner Commission Breakdown fetched successfully";
          code = "2009";
          break;
      }

      breakdownData = {
        code,
        message,
        data,
      };

      return breakdownData;
    } catch (error) {
      throw new Error(`Error getting commission breakdown: ${error}`);
    }
  }

  // Helper method to get hierarchical breakdown data
  private async getHierarchicalBreakdown(
    targetRole: string,
    parentId: string | null,
    _startDate: Date,
    _endDate: Date
  ) {
    // Build the where condition for the main target role
    const whereCondition: any = {
      settledStatus: "N",
      user: {
        role: {
          name: targetRole,
        },
      },
    };

    if (parentId) {
      whereCondition.user.parentId = parentId;
    }

    const summaries = await prisma.commissionSummary.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get unique user IDs from summaries and aggregate their data
    const userSummariesMap = new Map();
    summaries.forEach((summary) => {
      const userId = summary.user.id;
      if (!userSummariesMap.has(userId)) {
        userSummariesMap.set(userId, {
          user: summary.user,
          summaries: [],
        });
      }
      userSummariesMap.get(userId).summaries.push(summary);
    });

    // For operator requests, also get gold data for each platinum
    let goldSummaries: any[] = [];
    if (targetRole.toLowerCase() === "platinum") {
      goldSummaries = await prisma.commissionSummary.findMany({
        where: {
          settledStatus: "N",
          user: {
            role: {
              name: "gold",
            },
            parent: {
              id: {
                in: Array.from(userSummariesMap.keys()),
              },
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              parentId: true,
            },
          },
        },
      });
    }

    // Transform and organize data by role
    const platinumRows = [];
    const goldRows = [];

    // Process platinum users
    for (const [userId, data] of userSummariesMap) {
      const { user, summaries } = data;

      // Calculate aggregated values for the platinum user
      const platRow = {
        network: user.username,
        name: `${user.firstName} ${user.lastName}`,
        egamesCommission: summaries
          .filter((s) => s.categoryName.toLowerCase().includes("egames"))
          .reduce((sum, s) => sum + (s.netGGR || 0), 0),
        sportsCommission: summaries
          .filter((s) => s.categoryName.toLowerCase().includes("sportsbet"))
          .reduce((sum, s) => sum + (s.netGGR || 0), 0),
        paymentGatewayFee: summaries.reduce(
          (sum, s) => sum + (s.paymentGatewayFee || 0),
          0
        ),
        totalNetCommission: summaries.reduce(
          (sum, s) => sum + (s.netCommissionAvailablePayout || 0),
          0
        ),
        deductionsFromGross: summaries.reduce(
          (sum, s) => sum + (s.paymentGatewayFee || 0),
          0
        ),
        finalNetCommission: summaries.reduce(
          (sum, s) => sum + (s.netCommissionAvailablePayout || 0),
          0
        ),
        userId: user.id,
        isPlatinum: true,
      };
      platinumRows.push(platRow);
    }

    // Add platinum total
    if (platinumRows.length > 0) {
      const platinumTotal = {
        network: "",
        name: "PLATINUM PARTNER TOTAL",
        egamesCommission: platinumRows.reduce(
          (sum, row) => sum + row.egamesCommission,
          0
        ),
        sportsCommission: platinumRows.reduce(
          (sum, row) => sum + row.sportsCommission,
          0
        ),
        paymentGatewayFee: platinumRows.reduce(
          (sum, row) => sum + row.paymentGatewayFee,
          0
        ),
        totalNetCommission: platinumRows.reduce(
          (sum, row) => sum + row.totalNetCommission,
          0
        ),
        deductionsFromGross: platinumRows.reduce(
          (sum, row) => sum + row.deductionsFromGross,
          0
        ),
        finalNetCommission: platinumRows.reduce(
          (sum, row) => sum + row.finalNetCommission,
          0
        ),
        userId: "platinum-total",
        isPlatinumTotal: true,
      };
      platinumRows.push(platinumTotal);
    }

    // Group gold summaries by user and aggregate their data
    const goldUsersMap = new Map();
    goldSummaries.forEach((gold) => {
      if (!goldUsersMap.has(gold.user.id)) {
        goldUsersMap.set(gold.user.id, {
          user: gold.user,
          egamesCommission: 0,
          sportsCommission: 0,
          paymentGatewayFee: 0,
          totalNetCommission: 0,
          deductionsFromGross: 0,
          finalNetCommission: 0,
        });
      }

      const goldData = goldUsersMap.get(gold.user.id);
      if (gold.categoryName.toLowerCase().includes("egames")) {
        goldData.egamesCommission += gold.netGGR || 0;
      }
      if (gold.categoryName.toLowerCase().includes("sports")) {
        goldData.sportsCommission += gold.netGGR || 0;
      }
      goldData.paymentGatewayFee += gold.paymentGatewayFee || 0;
      goldData.totalNetCommission += gold.netCommissionAvailablePayout || 0;
      goldData.deductionsFromGross += gold.paymentGatewayFee || 0;
      goldData.finalNetCommission += gold.netCommissionAvailablePayout || 0;
    });

    // Add gold rows
    for (const [goldId, goldData] of goldUsersMap) {
      const goldRow = {
        network: goldData.user.username,
        name: `${goldData.user.firstName} ${goldData.user.lastName}`,
        egamesCommission: goldData.egamesCommission,
        sportsCommission: goldData.sportsCommission,
        paymentGatewayFee: goldData.paymentGatewayFee,
        totalNetCommission: goldData.totalNetCommission,
        deductionsFromGross: goldData.deductionsFromGross,
        finalNetCommission: goldData.finalNetCommission,
        userId: goldId,
        parentId: goldData.user.parentId,
        isGold: true,
      };
      goldRows.push(goldRow);
    }

    // Add gold total
    if (goldRows.length > 0) {
      const goldTotal = {
        network: "",
        name: "GOLD PARTNER TOTAL",
        egamesCommission: goldRows.reduce(
          (sum, row) => sum + row.egamesCommission,
          0
        ),
        sportsCommission: goldRows.reduce(
          (sum, row) => sum + row.sportsCommission,
          0
        ),
        paymentGatewayFee: goldRows.reduce(
          (sum, row) => sum + row.paymentGatewayFee,
          0
        ),
        totalNetCommission: goldRows.reduce(
          (sum, row) => sum + row.totalNetCommission,
          0
        ),
        deductionsFromGross: goldRows.reduce(
          (sum, row) => sum + row.deductionsFromGross,
          0
        ),
        finalNetCommission: goldRows.reduce(
          (sum, row) => sum + row.finalNetCommission,
          0
        ),
        userId: "gold-total",
        isGoldTotal: true,
      };
      goldRows.push(goldTotal);
    }

    return {
      columns: [
        "Network",
        "Name",
        "Total EGames Gross Commissions",
        "Total Sports Gross Commissions",
        "Less: Payment Gateway Fees",
        "Total Net Commissions",
        "Total Deductions",
        "Final Net Commission",
      ],
      data: {
        platinum: platinumRows,
        gold: goldRows,
      },
    };
  }

  public async getLicenseBreakdown(userId: string, roleName: string) {
    try {
      roleName = roleName.toLowerCase();

      // Get all child users based on role hierarchy
      let userIds = [userId];
      const childrenIds = await this.getAllChildrenIds(userId, roleName);
      userIds = [...userIds, ...childrenIds];

      // Initialize license data structure
      const licenseData: Record<string, LicenseData> = {
        "E-Games": {
          type: "egames",
          ggr: { pending: 0, allTime: 0 },
          commission: { pending: 0, allTime: 0 },
          commissionRate: 0.3,
        },
        "Sports Betting": {
          type: "sports",
          betAmount: { pending: 0, allTime: 0 },
          commission: { pending: 0, allTime: 0 },
          commissionRate: 0.02,
        },
        "Speciality Games - Tote": {
          type: "specialityGamesTote",
          betAmount: { pending: 0, allTime: 0 },
          commission: { pending: 0, allTime: 0 },
          commissionRate: 0.02,
        },
        "Speciality Games - RNG": {
          type: "specialityGamesRNG",
          ggr: { pending: 0, allTime: 0 },
          commission: { pending: 0, allTime: 0 },
          commissionRate: 0.3,
        },
      };

      // Get all commission summaries
      const commissionSummaries = await prisma.commissionSummary.findMany({
        where: {
          userId: { in: userIds },
          categoryName: {
            in: ["egames", "sportsbet", "tote", "rng"],
          },
        },
      });

      // Split into pending and settled based on settledStatus
      const pendingSummaries = commissionSummaries.filter(
        (summary) => summary.settledStatus !== "Y"
      );
      const settledSummaries = commissionSummaries.filter(
        (summary) => summary.settledStatus === "Y"
      );

      // Process pending summaries
      pendingSummaries.forEach((summary) => {
        const categoryName = summary.categoryName.toLowerCase();
        let data;

        switch (categoryName) {
          case "egames":
            data = licenseData["E-Games"];
            if (data.type === "egames") {
              const ggr = summary.netGGR || 0;
              const commission = ggr * data.commissionRate;
              data.ggr.pending += ggr;
              data.commission.pending += commission;
            }
            break;

          case "sportsbet":
            data = licenseData["Sports Betting"];
            if (data.type === "sports") {
              const betAmount = summary.totalBetAmount || 0;
              const commission = betAmount * data.commissionRate;
              data.betAmount.pending += betAmount;
              data.commission.pending += commission;
            }
            break;

          case "tote":
            data = licenseData["Speciality Games - Tote"];
            if (data.type === "specialityGamesTote") {
              const betAmount = summary.totalBetAmount || 0;
              const commission = betAmount * data.commissionRate;
              data.betAmount.pending += betAmount;
              data.commission.pending += commission;
            }
            break;

          case "rng":
            data = licenseData["Speciality Games - RNG"];
            if (data.type === "specialityGamesRNG") {
              const ggr = summary.netGGR || 0;
              const commission = ggr * data.commissionRate;
              data.ggr.pending += ggr;
              data.commission.pending += commission;
            }
            break;
        }
      });

      // Process settled summaries for allTime
      settledSummaries.forEach((summary) => {
        const categoryName = summary.categoryName.toLowerCase();
        let data;

        switch (categoryName) {
          case "egames":
            data = licenseData["E-Games"];
            if (data.type === "egames") {
              const ggr = summary.netGGR || 0;
              const commission = ggr * data.commissionRate;
              data.ggr.allTime += ggr;
              data.commission.allTime += commission;
            }
            break;

          case "sportsbet":
            data = licenseData["Sports Betting"];
            if (data.type === "sports") {
              const betAmount = summary.totalBetAmount || 0;
              const commission = betAmount * data.commissionRate;
              data.betAmount.allTime += betAmount;
              data.commission.allTime += commission;
            }
            break;

          case "tote":
            data = licenseData["Speciality Games - Tote"];
            if (data.type === "specialityGamesTote") {
              const betAmount = summary.totalBetAmount || 0;
              const commission = betAmount * data.commissionRate;
              data.betAmount.allTime += betAmount;
              data.commission.allTime += commission;
            }
            break;

          case "rng":
            data = licenseData["Speciality Games - RNG"];
            if (data.type === "specialityGamesRNG") {
              const ggr = summary.netGGR || 0;
              const commission = ggr * data.commissionRate;
              data.ggr.allTime += ggr;
              data.commission.allTime += commission;
            }
            break;
        }
      });

      // Return flattened response structure
      return {
        code: "2010",
        message: "License Commission Breakdown fetched successfully",
        data: {
          userId,
          role: roleName,
          data: Object.entries(licenseData).map(([license, data]) => ({
            license,
            fields: [
              {
                label: data.type === "egames" || data.type === "specialityGamesRNG" ? "GGR" : "Total Bet Amount",
                pendingSettlement:
                  data.type === "egames" || data.type === "specialityGamesRNG"
                    ? data.ggr.pending
                    : data.betAmount.pending,
                settledAllTime:
                  data.type === "egames" || data.type === "specialityGamesRNG"
                    ? data.ggr.allTime
                    : data.betAmount.allTime,
              },
              {
                label: "Commission Rate",
                value: `${(data.commissionRate * 100).toFixed(1)}%`,
              },
              {
                label: "Total Commission",
                pendingSettlement: data.commission.pending,
                settledAllTime: data.commission.allTime,
              },
            ],
          })),
        },
      };
    } catch (error) {
      throw new Error(`Error getting license breakdown: ${error}`);
    }
  }

  // Helper method to recursively get all children IDs
  private async getAllChildrenIds(
    userId: string,
    roleName: string
  ): Promise<string[]> {
    let childIds: string[] = [];
    let directChildren: { id: string }[] = [];

    // Get direct children based on role
    switch (roleName) {
      case "superadmin":
        directChildren = await prisma.user.findMany({
          where: { role: { name: "operator" } },
          select: { id: true },
        });
        break;
      case "operator":
        directChildren = await prisma.user.findMany({
          where: {
            parentId: userId,
            role: { name: "platinum" },
          },
          select: { id: true },
        });
        break;
      case "platinum":
        directChildren = await prisma.user.findMany({
          where: {
            parentId: userId,
            role: { name: "gold" },
          },
          select: { id: true },
        });
        break;
    }

    // Add direct children IDs
    childIds = directChildren.map((child) => child.id);

    // Recursively get grandchildren for operator role
    if (roleName === "operator") {
      for (const child of directChildren) {
        const grandChildren = await prisma.user.findMany({
          where: {
            parentId: child.id,
            role: { name: "gold" },
          },
          select: { id: true },
        });
        childIds = [...childIds, ...grandChildren.map((gc) => gc.id)];
      }
    }

    return childIds;
  }
}

export { CommissionService };
