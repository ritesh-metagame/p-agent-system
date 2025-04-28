import { Service } from "typedi";
import { Commission, User } from "../../prisma/generated/prisma";
import { CommissionDao } from "../daos/commission.dao";
import { RoleDao } from "../daos/role.dao";
import { GenerateCommission } from "../daos/generateCommission";
import { prisma } from "../server";
import {
  CommissionComputationPeriod,
  DEFAULT_COMMISSION_COMPUTATION_PERIOD,
  UserRole,
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
  type: "E-Games";
  ggr: { pending: number; allTime: number };
  commission: { pending: number; allTime: number };
  commissionRate: number;
}

interface SportsBettingLicenseData {
  type: "Sports Betting";
  betAmount: { pending: number; allTime: number };
  commission: { pending: number; allTime: number };
  commissionRate: number;
}

interface SpecialityGamesToteLicenseData {
  type: "Speciality Games - Tote";
  betAmount: { pending: number; allTime: number };
  commission: { pending: number; allTime: number };
  commissionRate: number;
}

interface SpecialityGamesRNGLicenseData {
  type: "Speciality Games - RNG";
  ggr: { pending: number; allTime: number };
  commission: { pending: number; allTime: number };
  commissionRate: number;
}

type LicenseData =
  | EGamesLicenseData
  | SportsBettingLicenseData
  | SpecialityGamesToteLicenseData
  | SpecialityGamesRNGLicenseData;

// Default commission rates for superadmin
const SUPER_ADMIN_DEFAULT_COMMISSION_RATES = {
  "E-Games": 30,
  "Sports Betting": 2,
  "Speciality Games - Tote": 2,
  "Speciality Games - RNG": 30,
};

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
      if (roleName === UserRole.SUPER_ADMIN) {
        summaries = await this.commissionDao.getSuperAdminCommissionSummaries();
      } else if (roleName === UserRole.OPERATOR) {
        summaries = await this.commissionDao.getOperatorCommissionSummaries(
          user.id
        );
      } else if (roleName === UserRole.PLATINUM) {
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

          if (roleName === UserRole.SUPER_ADMIN) {
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

            if (role === UserRole.OPERATOR) {
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
                grossCommission: summary.netGGR,
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
              acc[platform]["ALL OPERATORS"].grossCommission += summary.netGGR;
              acc[platform]["ALL OPERATORS"].netCommissionAvailablePayout +=
                summary.netCommissionAvailablePayout;
            }
          } else if (roleName === UserRole.OPERATOR) {
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
            if (role === UserRole.OPERATOR) {
              acc[platform][UserRole.OPERATOR] = {
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
                grossCommission: summary.netGGR,
                netCommissionAvailablePayout:
                  summary.netCommissionAvailablePayout,
              };
            } else if (role === UserRole.PLATINUM) {
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
                grossCommission: summary.netGGR,
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
              acc[platform]["ALL PLATINUMS"].grossCommission += summary.netGGR;
              acc[platform]["ALL PLATINUMS"].netCommissionAvailablePayout +=
                summary.netCommissionAvailablePayout;
            } else if (role === UserRole.GOLDEN && summary.user.parent) {
              // Add golden agents to their platinum parent's children array
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
                  grossCommission: summary.netGGR,
                  netCommissionAvailablePayout:
                    summary.netCommissionAvailablePayout,
                });
              }
            }
          } else if (roleName === UserRole.PLATINUM) {
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

            if (role === UserRole.PLATINUM) {
              // Add platinum's own data
              acc[platform][UserRole.PLATINUM] = {
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
                grossCommission: summary.netGGR,
                netCommissionAvailablePayout:
                  summary.netCommissionAvailablePayout,
              };
            } else if (role === UserRole.GOLDEN) {
              // Add golden data to ALL GOLDS
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
                grossCommission: summary.netGGR,
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
              acc[platform]["ALL GOLDS"].grossCommission += summary.netGGR;
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
              grossCommission: summary.netGGR,
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
      // Get the category name for the categoryId if provided
      let categoryName: string | undefined;
      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
          select: { name: true },
        });
        categoryName = category?.name;
      }

      // Calculate the date range for the previously completed cycle based on category
      const { cycleStartDate, cycleEndDate } =
        await this.getPreviousCompletedCycleDates(categoryName);

      const pendingPeriod = {
        start: format(cycleStartDate, "yyyy-MM-dd"),
        end: format(cycleEndDate, "yyyy-MM-dd"),
      };

      // Get commission data by category for the specified user only
      const categories = [
        "E-Sports",
        "Sports Betting",
        "Speciality Games - RNG",
        "Speciality Games - Tote",
      ];
      const categoryData: any = {};

      for (const category of categories) {
        console.log({ category, cycleStartDate, cycleEndDate });

        // Get the cycle dates specific to this category
        const categoryCycleDates =
          await this.getPreviousCompletedCycleDates(category);

        // Get commission data for pending settlements
        const pendingSettlements = await prisma.commissionSummary.findMany({
          where: {
            userId: userId,
            categoryName: category,
            createdAt: {
              gte: categoryCycleDates.cycleStartDate,
              lte: categoryCycleDates.cycleEndDate,
            },
            settledStatus: "N",
          },
          select: {
            totalDeposit: true,
            totalWithdrawals: true,
            totalBetAmount: true,
            netGGR: true,
            grossCommission: true,
            paymentGatewayFee: true,
            netCommissionAvailablePayout: true,
            createdAt: true,
          },
        });

        console.log({ pendingSettlements });

        // Get all-time data for the category
        const allTimeData = await prisma.commissionSummary.findMany({
          where: {
            userId: userId,
            categoryName: category,
            settledStatus: "Y",
          },
          select: {
            totalDeposit: true,
            totalWithdrawals: true,
            totalBetAmount: true,
            netGGR: true,
            grossCommission: true,
            paymentGatewayFee: true,
            netCommissionAvailablePayout: true,
          },
        });

        // Calculate totals for pending settlements
        const pendingTotals = pendingSettlements.reduce(
          (acc, curr) => ({
            totalDeposit: acc.totalDeposit + (curr.totalDeposit || 0),
            totalWithdrawals:
              acc.totalWithdrawals + (curr.totalWithdrawals || 0),
            totalBetAmount: acc.totalBetAmount + (curr.totalBetAmount || 0),
            netGGR: acc.netGGR + (curr.netGGR || 0),
            grossCommission: acc.grossCommission + (curr.netGGR || 0),
            paymentGatewayFee:
              acc.paymentGatewayFee + (curr.paymentGatewayFee || 0),
            netCommissionAvailablePayout:
              acc.netCommissionAvailablePayout +
              (curr.netCommissionAvailablePayout || 0),
          }),
          {
            totalDeposit: 0,
            totalWithdrawals: 0,
            totalBetAmount: 0,
            netGGR: 0,
            grossCommission: 0,
            paymentGatewayFee: 0,
            netCommissionAvailablePayout: 0,
          }
        );

        // Calculate totals for all-time data
        const allTimeTotals = allTimeData.reduce(
          (acc, curr) => ({
            totalDeposit: acc.totalDeposit + (curr.totalDeposit || 0),
            totalWithdrawals:
              acc.totalWithdrawals + (curr.totalWithdrawals || 0),
            totalBetAmount: acc.totalBetAmount + (curr.totalBetAmount || 0),
            netGGR: acc.netGGR + (curr.netGGR || 0),
            grossCommission: acc.grossCommission + (curr.grossCommission || 0),
            paymentGatewayFee:
              acc.paymentGatewayFee + (curr.paymentGatewayFee || 0),
            netCommissionAvailablePayout:
              acc.netCommissionAvailablePayout +
              (curr.netCommissionAvailablePayout || 0),
          }),
          {
            totalDeposit: 0,
            totalWithdrawals: 0,
            totalBetAmount: 0,
            netGGR: 0,
            grossCommission: 0,
            paymentGatewayFee: 0,
            netCommissionAvailablePayout: 0,
          }
        );

        categoryData[category] = {
          pending: pendingTotals,
          allTime: allTimeTotals,
        };
      }

      // Check if any data exists
      const hasData = Object.values(categoryData).some(
        (catData: any) =>
          catData.pending.totalDeposit > 0 ||
          catData.pending.totalWithdrawals > 0 ||
          catData.pending.totalBetAmount > 0 ||
          catData.pending.netGGR > 0 ||
          catData.pending.netCommissionAvailablePayout > 0 ||
          catData.allTime.totalDeposit > 0 ||
          catData.allTime.totalWithdrawals > 0 ||
          catData.allTime.totalBetAmount > 0 ||
          catData.allTime.netGGR > 0 ||
          catData.allTime.netCommissionAvailablePayout > 0
      );

      // If no data found, return empty report with message
      if (!hasData) {
        return {
          code: "2003",
          message: "Commission fetched successfully",
          data: {
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
            categories: {
              "E-GAMES": this.getEmptyOverview(),
              "SPORTS BETTING": this.getEmptyOverview(),
            },
          },
        };
      }

      // Generate the overview metrics for each category
      const eGamesOverview = this.generateOverviewMetrics(
        categoryData["E-Games"].pending,
        categoryData["E-Games"].allTime
      );

      const sportsBettingOverview = this.generateOverviewMetrics(
        categoryData["Sports Betting"].pending,
        categoryData["Sports Betting"].allTime
      );

      // Combine the overviews to get total overview
      const totalOverview = eGamesOverview.map((metric, index) => ({
        label: metric.label,
        pendingSettlement:
          metric.pendingSettlement +
          sportsBettingOverview[index].pendingSettlement,
        allTime: metric.allTime + sportsBettingOverview[index].allTime,
      }));

      return {
        code: "2003",
        message: "Commission fetched successfully",
        data: {
          columns: [
            "",
            "Amount based on latest completed commission periods pending settlement",
            "All Time",
          ],
          periodInfo: {
            pendingPeriod,
            noDataMessage: hasData
              ? undefined
              : `No commission data available for this period (${pendingPeriod.start} to ${pendingPeriod.end})`,
          },
          overview: totalOverview,
          categories: {
            "E-GAMES": eGamesOverview,
            "SPORTS BETTING": sportsBettingOverview,
          },
        },
      };
    } catch (error) {
      throw new Error(`Error generating commission payout report: ${error}`);
    }
  }

  private getEmptyOverview() {
    return [
      {
        label: "Total Deposits",
        pendingSettlement: 0,
        allTime: 0,
      },
      {
        label: "Total Withdrawals",
        pendingSettlement: 0,
        allTime: 0,
      },
      {
        label: "Total Bet Amount (Turnover)",
        pendingSettlement: 0,
        allTime: 0,
      },
      {
        label: "Net GGR",
        pendingSettlement: 0,
        allTime: 0,
      },
      {
        label: "Gross Commission (% of Net GGR)",
        pendingSettlement: 0,
        allTime: 0,
      },
      {
        label: "Payment Gateway Fees",
        pendingSettlement: 0,
        allTime: 0,
      },
      {
        label: "Net Commission Available for Payout",
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
        grossCommission: acc.grossCommission + (curr._sum?.netGGR || 0),
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
        label: "Total Deposits",
        pendingSettlement: pendingTotal.totalDeposit,
        allTime: allTimeTotal.totalDeposit,
      },
      {
        label: "Total Withdrawals",
        pendingSettlement: pendingTotal.totalWithdrawals,
        allTime: allTimeTotal.totalWithdrawals,
      },
      {
        label: "Total Bet Amount (Turnover)",
        pendingSettlement: pendingTotal.totalBetAmount,
        allTime: allTimeTotal.totalBetAmount,
      },
      {
        label: "Net GGR",
        pendingSettlement: pendingTotal.netGGR,
        allTime: allTimeTotal.netGGR,
      },
      {
        label: "Gross Commission (% of Net GGR)",
        pendingSettlement: pendingTotal.grossCommission,
        allTime: allTimeTotal.grossCommission,
      },
      {
        label: "Payment Gateway Fees",
        pendingSettlement: pendingTotal.paymentGatewayFee,
        allTime: allTimeTotal.paymentGatewayFee,
      },
      {
        label: "Net Commission Available for Payout",
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
        case UserRole.SUPER_ADMIN:
          // Get all operators' summaries
          commissionSummaries = await prisma.commissionSummary.findMany({
            where: {
              createdAt: {
                gte: startDate,
                lte: timestamp,
              },
              role: {
                name: UserRole.OPERATOR,
              },
            },
            select: {
              netCommissionAvailablePayout: true,
              categoryName: true,
            },
          });
          break;

        case UserRole.OPERATOR:
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
                  name: UserRole.PLATINUM,
                },
              },
            },
            include: {
              user: true,
              role: true,
            },
          });
          break;

        case UserRole.PLATINUM:
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
                  name: UserRole.GOLDEN,
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
        if (summary.categoryName === "E-Games") {
          result.tally[0].eGames += Number(
            summary.netCommissionAvailablePayout || 0
          );
        } else if (summary.categoryName === "Sports Betting") {
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
      case UserRole.SUPER_ADMIN:
        return "ALL OPERATORS";
      case UserRole.OPERATOR:
        return "ALL PLATINUMS";
      case UserRole.PLATINUM:
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

  private async getPaymentGatewayFee(
    userId: string,
    settled: boolean = false,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const commissions = await prisma.commissionSummary.findMany({
      where: {
        userId: userId,
        paymentGatewayFee: {
          gte: 0,
        },
        ...(settled ? { settledStatus: "Y" } : { settledStatus: "N" }),
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

  public async getTotalBreakdown(userId: string, roleName: string) {
    try {
      let userIds = [userId];
      roleName = roleName.toLowerCase();

      console.log({ userId, roleName });

      // const eGamesCommissionPercentage = await prisma.commission.findFirst({
      //   where: {
      //     userId: userId,
      //     category: { name: "E-Games" },
      //   },
      //   select: { commissionPercentage: true },
      // });

      // const sportsBettingCommissionPercentage =
      //   await prisma.commission.findFirst({
      //     where: {
      //       userId: userId,
      //       category: { name: "Sports Betting" },
      //     },
      //     select: { commissionPercentage: true },
      //   });

      // const specialtyGamesRNGCommissionPercentage =
      //   await prisma.commission.findFirst({
      //     where: {
      //       userId: userId,
      //       category: { name: "Speciality Games - RNG" },
      //     },
      //     select: { commissionPercentage: true },
      //   });

      // const specialtyGamesToteCommissionPercentage =
      //   await prisma.commission.findFirst({
      //     where: {
      //       userId: userId,
      //       category: { name: "Speciality Games - Tote" },
      //     },
      //     select: { commissionPercentage: true },
      //   });

      // Handle hierarchy based access
      if (roleName === UserRole.SUPER_ADMIN) {
        const operators = await prisma.user.findMany({
          where: {
            parentId: userId,
            role: { name: UserRole.OPERATOR },
          },
          select: { id: true },
        });
        userIds = operators.map((op) => op.id);

        const platinums = await prisma.user.findMany({
          where: {
            parentId: { in: operators.map((op) => op.id) },
            role: { name: UserRole.PLATINUM },
          },
          select: { id: true },
        });

        userIds = userIds.concat(platinums.map((platinum) => platinum.id));

        const goldens = await prisma.user.findMany({
          where: {
            parentId: { in: platinums.map((platinum) => platinum.id) },
            role: { name: UserRole.GOLDEN },
          },
          select: { id: true },
        });

        userIds = userIds.concat(goldens.map((golden) => golden.id));
      }

      if (roleName === UserRole.OPERATOR) {
        const platinums = await prisma.user.findMany({
          where: {
            parentId: userId,
            role: { name: UserRole.PLATINUM },
          },
          select: { id: true },
        });
        userIds = platinums.map((platinum) => platinum.id);
      }

      if (roleName === UserRole.PLATINUM) {
        const goldens = await prisma.user.findMany({
          where: {
            parentId: userId,
            role: { name: UserRole.GOLDEN },
          },
          select: { id: true },
        });
        userIds = goldens.map((golden) => golden.id);
      }

      // console.log({
      //   eGamesCommissionPercentage,
      //   specialtyGamesRNGCommissionPercentage,
      //   specialtyGamesToteCommissionPercentage,
      // });

      // Initialize an object to store category-specific data
      const categoryData = {
        "E-Games": { pending: [], settled: [] },
        "Sports Betting": { pending: [], settled: [] },
        "Speciality Games - Tote": { pending: [], settled: [] },
        "Speciality Games - RNG": { pending: [], settled: [] },
      };

      // Get cycle dates for each category and fetch data
      for (const category of Object.keys(categoryData)) {
        // Get category-specific cycle dates
        const { cycleStartDate, cycleEndDate } =
          await this.getPreviousCompletedCycleDates(category);

        console.log({ category, cycleStartDate, cycleEndDate });

        // Get pending settlement data for this category
        const pendingData = await prisma.commissionSummary.findMany({
          where: {
            userId: { in: userIds },
            categoryName: category,
            createdAt: {
              gte: cycleStartDate,
              lte: cycleEndDate,
            },
            settledStatus: "N",
          },
          select: {
            categoryName: true,
            totalBetAmount: true,
            netGGR: true,
            grossCommission: true,
            paymentGatewayFee: true,
            netCommissionAvailablePayout: true,
          },
        });

        categoryData[category].pending = pendingData;

        // Get settled data for this category
        const settledData = await prisma.commissionSummary.findMany({
          where: {
            userId: { in: userIds },
            categoryName: category,
            settledStatus: "Y",
          },
          select: {
            categoryName: true,
            totalBetAmount: true,
            netGGR: true,
            grossCommission: true,
            paymentGatewayFee: true,
            netCommissionAvailablePayout: true,
          },
        });

        categoryData[category].settled = settledData;
      }

      // Use the bimonthly cycle dates for display in the UI
      // This keeps the UI consistent while still using category-specific calculations
      const { cycleStartDate, cycleEndDate } =
        await this.getPreviousCompletedCycleDates("E-Games");

      // Initialize category totals
      const categoryTotals = {
        pending: {
          egames: { amount: 0, grossCommission: 0 },
          sports: { amount: 0, grossCommission: 0 },
          specialty: { amount: 0, grossCommission: 0 },
          totalGrossCommission: 0,
          totalPaymentGatewayFees: 0,
          netCommissionPayout: 0,
        },
        settled: {
          egames: { amount: 0, grossCommission: 0 },
          sports: { amount: 0, grossCommission: 0 },
          specialty: { amount: 0, grossCommission: 0 },
          totalGrossCommission: 0,
          totalPaymentGatewayFees: 0,
          netCommissionPayout: 0,
        },
      };

      // Process E-Games pending data
      categoryData["E-Games"].pending.forEach((summary) => {
        console.log({
          "E-Games": summary.netCommissionAvailablePayout || 0,
          "Net GGR": summary.netGGR,

          summary: summary,
        });
        categoryTotals.pending.egames.amount +=
          summary.netCommissionAvailablePayout || 0;
        categoryTotals.pending.egames.grossCommission +=
          summary.grossCommission;
        categoryTotals.pending.totalGrossCommission += summary.netGGR || 0;
        categoryTotals.pending.totalPaymentGatewayFees +=
          summary.paymentGatewayFee || 0;
        categoryTotals.pending.netCommissionPayout +=
          summary.netCommissionAvailablePayout || 0;
      });

      // Process Sports Betting pending data
      categoryData["Sports Betting"].pending.forEach((summary) => {
        console.log({
          "Sports Betting": summary.netCommissionAvailablePayout || 0,
          "Net GGR": summary.netGGR,
          summary: summary,
        });
        categoryTotals.pending.sports.amount +=
          summary.netCommissionAvailablePayout;
        categoryTotals.pending.sports.grossCommission +=
          summary.grossCommission || 0;
        categoryTotals.pending.totalGrossCommission +=
          summary.grossCommission || 0;
        categoryTotals.pending.totalPaymentGatewayFees +=
          summary.paymentGatewayFee || 0;
        categoryTotals.pending.netCommissionPayout +=
          summary.netCommissionAvailablePayout || 0;
      });

      // Process Specialty Games pending data
      const specialtyCategories = [
        "Speciality Games - Tote",
        "Speciality Games - RNG",
      ];

      // const categoryCommissionsMap = {
      //   "Speciality Games - Tote": specialtyGamesToteCommissionPercentage,
      //   "Speciality Games - RNG": specialtyGamesRNGCommissionPercentage,
      // };

      specialtyCategories.forEach((category) => {
        categoryData[category].pending.forEach((summary) => {
          categoryTotals.pending.specialty.amount +=
            summary.netCommissionAvailablePayout;
          categoryTotals.pending.specialty.grossCommission +=
            summary.grossCommission || 0;
          categoryTotals.pending.totalGrossCommission +=
            summary.grossCommission || 0;
          categoryTotals.pending.totalPaymentGatewayFees +=
            summary.paymentGatewayFee || 0;
          categoryTotals.pending.netCommissionPayout +=
            summary.netCommissionAvailablePayout || 0;
        });
      });

      // Process settled data for all categories
      const allCategories = [
        "E-Games",
        "Sports Betting",
        "Speciality Games - Tote",
        "Speciality Games - RNG",
      ];

      // Process E-Games settled data
      categoryData["E-Games"].settled.forEach((summary) => {
        categoryTotals.settled.egames.amount +=
          summary.netCommissionAvailablePayout || 0;
        categoryTotals.settled.egames.grossCommission +=
          summary.grossCommission || 0;
        categoryTotals.settled.totalGrossCommission +=
          summary.grossCommission || 0;
        categoryTotals.settled.totalPaymentGatewayFees +=
          summary.paymentGatewayFee || 0;
        categoryTotals.settled.netCommissionPayout +=
          summary.netCommissionAvailablePayout || 0;
      });

      // Process Sports Betting settled data
      categoryData["Sports Betting"].settled.forEach((summary) => {
        categoryTotals.settled.sports.amount +=
          summary.netCommissionAvailablePayout || 0;
        categoryTotals.settled.sports.grossCommission +=
          summary.grossCommission || 0;
        categoryTotals.settled.totalGrossCommission +=
          summary.grossCommission || 0;
        categoryTotals.settled.totalPaymentGatewayFees +=
          summary.paymentGatewayFee || 0;
        categoryTotals.settled.netCommissionPayout +=
          summary.netCommissionAvailablePayout || 0;
      });

      // Process Specialty Games settled data
      specialtyCategories.forEach((category) => {
        categoryData[category].settled.forEach((summary) => {
          categoryTotals.settled.specialty.amount +=
            summary.netCommissionAvailablePayout || 0;
          categoryTotals.settled.specialty.grossCommission +=
            summary.grossCommission || 0;
          categoryTotals.settled.totalGrossCommission +=
            summary.grossCommission || 0;
          categoryTotals.settled.totalPaymentGatewayFees +=
            summary.paymentGatewayFee || 0;
          categoryTotals.settled.netCommissionPayout +=
            summary.netCommissionAvailablePayout || 0;
        });
      });

      const pendingPaymentGatewayFees = await this.getPaymentGatewayFee(
        userId,
        false,
        cycleStartDate,
        cycleEndDate
      );
      console.log({ pendingPaymentGatewayFees });

      const settledPaymentGatewayFees = await this.getPaymentGatewayFee(
        userId,
        true,
        undefined,
        undefined
      );

      console.log({ settledPaymentGatewayFees });

      const totalPendingGrossCommission =
        categoryTotals.pending.egames.amount +
        categoryTotals.pending.sports.amount +
        categoryTotals.pending.specialty.amount;

      const totalSettledGrossCommission =
        categoryTotals.settled.egames.grossCommission +
        categoryTotals.settled.sports.grossCommission +
        categoryTotals.settled.specialty.grossCommission;

      const totalPendingNetCommissionPayout =
        totalPendingGrossCommission - pendingPaymentGatewayFees;

      const totalSettledNetCommissionPayout =
        totalSettledGrossCommission - settledPaymentGatewayFees;

      console.log({ categoryTotals });

      return {
        columns: [
          "",
          "Amount based on latest completed commission periods pending settlement",
          "Settled All Time",
        ],
        periodInfo: {
          pendingPeriod: {
            start: cycleStartDate.toISOString().split("T")[0],
            end: cycleEndDate.toISOString().split("T")[0],
          },
        },
        rows: [
          {
            label: "Total EGames",
            pendingSettlement: categoryTotals.pending.egames.amount,
            settledAllTime: categoryTotals.settled.egames.amount,
          },
          {
            label: "Total Sports Betting",
            pendingSettlement: categoryTotals.pending.sports.amount,
            settledAllTime: categoryTotals.settled.sports.amount,
          },
          {
            label: "Total Specialty Games",
            pendingSettlement: categoryTotals.pending.specialty.amount,
            settledAllTime: categoryTotals.settled.specialty.amount,
          },
          {
            label: "Gross Commissions",
            pendingSettlement: totalPendingGrossCommission,
            settledAllTime: totalSettledGrossCommission,
          },
          {
            label: "Less: Total Payment Gateway Fees",
            pendingSettlement: pendingPaymentGatewayFees,
            settledAllTime: settledPaymentGatewayFees,
          },
          {
            label: "Net Commission Available for Payout",
            pendingSettlement: totalPendingNetCommissionPayout,
            settledAllTime: totalSettledNetCommissionPayout,
            note: "(Gross Commission less Payment Gateway Fees)",
          },
        ],
      };
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

    if (roleName === UserRole.SUPER_ADMIN) {
      const operators = await prisma.user.findMany({
        where: {
          role: { name: UserRole.OPERATOR },
        },
        select: { id: true },
      });
      userIds = operators.map((op) => op.id);
    }

    // if (roleName.toLowerCase() === UserRole.OPERATOR) {
    //   // Get all platinum and golden users under this operator
    //   const platinums = await prisma.user.findMany({
    //     where: {
    //       parentId: userId,
    //       role: { name: UserRole.PLATINUM },
    //     },
    //     select: { id: true },
    //   });
    //   userIds = [...userIds, ...platinums.map((p) => p.id)];

    //   // Get all golden users under these platinums
    //   const golds = await prisma.user.findMany({
    //     where: {
    //       parentId: { in: platinums.map((p) => p.id) },
    //       role: { name: UserRole.GOLDEN },
    //     },
    //     select: { id: true },
    //   });
    //   userIds = [...userIds, ...golds.map((g) => g.id)];
    // } else if (roleName.toLowerCase() === UserRole.PLATINUM) {
    //   // Get all golden users under this platinum
    //   const golds = await prisma.user.findMany({
    //     where: {
    //       parentId: userId,
    //       role: { name: UserRole.GOLDEN },
    //     },
    //     select: { id: true },
    //   });
    //   userIds = [...userIds, ...golds.map((g) => g.id)];
    // }

    // Get fees from commission_summary where deposits and withdrawals are not null
    const summaries = await prisma.commissionSummary.findMany({
      where: {
        userId: { in: userIds },
        NOT: {
          categoryName: {
            in: [
              "E-Games",
              "Sports Betting",
              "Speciality Games - Tote",
              "Speciality Games - RNG",
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

  // private async getDirectChildrenIds(userId: string, roleName: string): Promise<string[]> {
  //   let childIds: string[] = [];

  //   // Get only direct children based on role
  //   switch (roleName.toLowerCase()) {
  //     case UserRole.SUPER_ADMIN:
  //       const operators = await prisma.user.findMany({
  //         where: { role: { name: UserRole.OPERATOR } },
  //         select: { id: true },
  //       });
  //       childIds = operators.map(op => op.id);
  //       break;

  //     case UserRole.OPERATOR:
  //       const platinums = await prisma.user.findMany({
  //         where: {
  //           parentId: userId,
  //           role: { name: UserRole.PLATINUM },
  //         },
  //         select: { id: true },
  //       });
  //       childIds = platinums.map(p => p.id);
  //       break;

  //     case UserRole.PLATINUM:
  //       const golds = await prisma.user.findMany({
  //         where: {
  //           parentId: userId,
  //           role: { name: UserRole.GOLDEN },
  //         },
  //         select: { id: true },
  //       });
  //       childIds = golds.map(g => g.id);
  //       break;
  //   }

  //   return childIds;
  // }

  public async getPendingSettlements(userId: string, roleName: string) {
    console.log("user id", userId);
    try {
      // Calculate the date range for the last completed cycle
      const { cycleStartDate, cycleEndDate } =
        await this.getPreviousCompletedCycleDates();

      // Get only direct child user IDs based on role hierarchy (one level down)
      // const childrenIds = await this.getDirectChildrenIds(userId, roleName);

      const childrenIds = await prisma.user
        .findMany({
          where: {
            parentId: userId,
          },
          select: { id: true },
        })
        .then((users) => users.map((user) => user.id));

      console.log("children ids", childrenIds);

      // Get summaries for direct children users in the completed cycle
      const commissionSummaries = await prisma.user.findMany({
        where: {
          id: { in: childrenIds },
        },
        include: {
          commissionSummaries: {
            where: {
              // createdAt: {
              //   gte: cycleStartDate,
              //   lte: cycleEndDate,
              // },
              settledStatus: "N",
              NOT: {
                categoryName: "Unknown",
              },
            },
            select: {
              id: true,
              // user: true,
              totalDeposit: true,
              totalWithdrawals: true,
              totalBetAmount: true,
              createdAt: true,
              netGGR: true,
              paymentGatewayFee: true,
              netCommissionAvailablePayout: true,
              categoryName: true,
            },
          },
        },
      });

      console.log({ commissionSummaries });

      // Transform data into required format
      const rows = await Promise.all(
        commissionSummaries.flatMap(async (user) => {
          const eGamesCommissionPercentage = await prisma.commission.findFirst({
            where: {
              userId: user.id,
              category: { name: "E-Games" },
            },
            select: { commissionPercentage: true },
          });

          const sportsBettingCommissionPercentage =
            await prisma.commission.findFirst({
              where: {
                userId: user.id,
                category: { name: "Sports Betting" },
              },
              select: { commissionPercentage: true },
            });

          const specialityGamesRNGCommissionPercentage =
            await prisma.commission.findFirst({
              where: {
                userId: user.id,
                category: { name: "Speciality Games - RNG" },
              },
              select: { commissionPercentage: true },
            });

          const specialityGamesToteCommissionPercentage =
            await prisma.commission.findFirst({
              where: {
                userId: user.id,
                category: { name: "Speciality Games - Tote" },
              },
              select: { commissionPercentage: true },
            });

          const categoryCommissionPercentagesMap = {
            "E-Games": eGamesCommissionPercentage?.commissionPercentage || 0,
            "Sports Betting":
              sportsBettingCommissionPercentage?.commissionPercentage || 0,
            "Speciality Games - RNG":
              specialityGamesRNGCommissionPercentage?.commissionPercentage || 0,
            "Speciality Games - Tote":
              specialityGamesToteCommissionPercentage?.commissionPercentage ||
              0,
          };

          console.log({
            eGamesCommissionPercentage,
            sportsBettingCommissionPercentage,
            specialityGamesRNGCommissionPercentage,
            specialityGamesToteCommissionPercentage,
          });

          // Group summaries by user (network)
          const summariesByUser = user.commissionSummaries.reduce(
            (acc, summary) => {
              if (!acc.summaries) {
                acc.summaries = [];
                acc.network = user.username || "Unknown";
                acc.bankName = user.bankName;
                acc.ids = [];
                acc.totalEgamesCommissions = 0;
                acc.totalSportsBettingCommissions = 0;
                acc.totalSpecialtyGamesCommissions = 0;
                acc.grossCommissions = 0;
                acc.paymentGatewayFees = 0;
                acc.netCommissions = 0;
              }

              acc.summaries.push(summary);

              acc.ids.push(summary.id);

              // Calculate totals by game category
              if (summary.categoryName.includes("E-Games")) {
                acc.totalEgamesCommissions +=
                  summary.netCommissionAvailablePayout || 0;
              } else if (summary.categoryName.includes("Sports Betting")) {
                // console.log({ totalBetAmount: summary.totalBetAmount });
                // console.log({CommissionPercentage:})
                acc.totalSportsBettingCommissions +=
                  summary.netCommissionAvailablePayout || 0;
              } else if (
                summary.categoryName.includes("Speciality Games - RNG") ||
                summary.categoryName.includes("Speciality Games - Tote")
              ) {
                acc.totalSpecialtyGamesCommissions +=
                  summary.netCommissionAvailablePayout || 0;
              }

              console.log({ summary });

              const totalGrossCommissions =
                acc.totalEgamesCommissions +
                acc.totalSportsBettingCommissions +
                acc.totalSpecialtyGamesCommissions;

              console.log({
                totalGrossCommissions,
              });

              // Update overall totals
              acc.grossCommissions += summary.netGGR || 0;
              acc.paymentGatewayFees += summary.paymentGatewayFee || 0;
              acc.netCommissions += summary.netCommissionAvailablePayout || 0;

              return acc;
            },
            {} as any
          );

          const pendingPaymentGatewayFees = await this.getPaymentGatewayFee(
            user.id,
            false,
            cycleStartDate,
            cycleEndDate
          );
          console.log({ pendingPaymentGatewayFees });

          // If user has no summaries, return empty array
          if (
            !summariesByUser.summaries ||
            summariesByUser.summaries.length === 0
          ) {
            return [];
          }

          // Create a unified row for this user with all category totals
          return {
            ids: summariesByUser.ids,
            network: summariesByUser.network,
            totalEgamesCommissions: summariesByUser.totalEgamesCommissions,
            bankName: summariesByUser.bankName,
            totalSportsBettingCommissions:
              summariesByUser.totalSportsBettingCommissions,
            totalSpecialtyGamesCommissions:
              summariesByUser.totalSpecialtyGamesCommissions,
            grossCommissions:
              summariesByUser.totalEgamesCommissions +
              summariesByUser.totalSportsBettingCommissions +
              summariesByUser.totalSpecialtyGamesCommissions,
            paymentGatewayFees: pendingPaymentGatewayFees,
            netCommissions:
              summariesByUser.totalEgamesCommissions +
              summariesByUser.totalSportsBettingCommissions +
              summariesByUser.totalSpecialtyGamesCommissions -
              pendingPaymentGatewayFees,
            breakdownAction: "view",
            releaseAction: "release_comms",
          };
        })
      );

      return {
        columns: [
          "Network",
          "Total EGames Commissions",
          "Total Sports Betting Commissions",
          "Total Specialty Games Commissions",
          "Gross Commissions",
          "Less: Payment Gateway Fees",
          "Total Net Commissions for Settlement",
          "Breakdown",
          "Release Commissions",
        ],
        periodInfo: {
          start: format(cycleStartDate, "yyyy-MM-dd"),
          end: format(cycleEndDate, "yyyy-MM-dd"),
        },
        rows: rows.filter((row) => !Array.isArray(row)),
      };
    } catch (error) {
      throw new Error(`Error getting pending settlements: ${error}`);
    }
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
            name: UserRole.OPERATOR,
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
        egamesCommission: op.categoryName.toLowerCase().includes("E-Games")
          ? op.netGGR
          : 0,
        sportsCommission: op.categoryName
          .toLowerCase()
          .includes("Sports Betting")
          ? op.netGGR
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
            name: UserRole.PLATINUM,
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
        egamesCommission: plat.categoryName.toLowerCase().includes("E-Games")
          ? plat.netGGR
          : 0,
        sportsCommission: plat.categoryName
          .toLowerCase()
          .includes("Sports Betting")
          ? plat.netGGR
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
            name: UserRole.GOLDEN,
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

      const rows = goldens.map((golden) => ({
        network: golden.user.username,
        name: `${golden.user.firstName} ${golden.user.lastName}`,
        egamesCommission: golden.categoryName.toLowerCase().includes("E-Games")
          ? golden.netGGR
          : 0,
        sportsCommission: golden.categoryName
          .toLowerCase()
          .includes("Sports Betting")
          ? golden.netGGR
          : 0,
        paymentGatewayFee: golden.paymentGatewayFee,
        totalNetCommission: golden.netCommissionAvailablePayout,
        deductionsFromGross: golden.paymentGatewayFee,
        finalNetCommission: golden.netCommissionAvailablePayout,
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
  private async getPreviousCompletedCycleDates(categoryName?: string) {
    const currentDate = new Date();

    // If in test mode, return dates from 1 month back
    if (process.env.VIEW_MODE === "test") {
      const oneMonthAgo = new Date(currentDate);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
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

  // Helper method to get weekly cycle dates for Sports Betting and Speciality Games - Tote
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
      cycleEndDate: mostRecentSunday,
    };
  }

  public async getCommissionBreakdown(
    userId: string,
    role: string,
    startDate?: Date,
    endDate?: Date,
    targetUserId?: string
  ) {
    try {
      console.log(
        "Commission breakdown params:",
        userId,
        role,
        startDate,
        endDate,
        targetUserId
      );
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

        console.log("Target user:", targetUser);

        if (!targetUser || !targetUser.role) {
          throw new Error("Target user not found or has no role");
        }

        targetRole = targetUser.role.name.toLowerCase();
        effectiveUserId = targetUserId;
      }

      // Get summaries for platinums
      const platinumSummaries = await prisma.commissionSummary.findMany({
        where: {
          settledStatus: "N",
          createdAt: {
            gte: cycleStartDate,
            lte: cycleEndDate,
          },
          role: {
            name: UserRole.PLATINUM,
          },
          user: {
            parentId: effectiveUserId,
          },
        },
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

      console.log({ platinumSummaries });

      // Get summaries for golds
      const goldSummaries = await prisma.commissionSummary.findMany({
        where: {
          settledStatus: "N",
          createdAt: {
            gte: cycleStartDate,
            lte: cycleEndDate,
          },
          role: {
            name: UserRole.GOLDEN,
          },
          user: {
            parentId: effectiveUserId,
          },
          // user: {
          //   parent: {
          //     parentId: effectiveUserId, // This ensures we get golds under the platinums of the operator
          //   },
          // },
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

      console.log("--------------", goldSummaries);

      // Process platinum data
      const platinumRows = [];
      const platinumUserMap = new Map();

      platinumSummaries.forEach((summary) => {
        if (!platinumUserMap.has(summary.user.id)) {
          platinumUserMap.set(summary.user.id, {
            network: summary.user.username,
            name: `${summary.user.firstName} ${summary.user.lastName}`,
            egamesCommission: 0,
            sportsCommission: 0,
            paymentGatewayFee: 0,
            totalNetCommission: 0,
            deductionsFromGross: 0,
            finalNetCommission: 0,
            userId: summary.user.id,
            isPlatinum: true,
          });
        }

        const userData = platinumUserMap.get(summary.user.id);
        if (summary.categoryName.includes("E-Games")) {
          userData.egamesCommission += summary.netGGR || 0;
        } else if (summary.categoryName.includes("Sports Betting")) {
          userData.sportsCommission += summary.netGGR || 0;
        }
        userData.paymentGatewayFee += summary.paymentGatewayFee || 0;
        userData.totalNetCommission +=
          summary.netCommissionAvailablePayout || 0;
        userData.deductionsFromGross += summary.paymentGatewayFee || 0;
        userData.finalNetCommission +=
          summary.netCommissionAvailablePayout || 0;
      });

      platinumRows.push(...platinumUserMap.values());

      // Add platinum total if there are platinum rows
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

      // Process golden data
      const goldRows = [];
      const goldUserMap = new Map();

      goldSummaries.forEach((summary) => {
        if (!goldUserMap.has(summary.user.id)) {
          goldUserMap.set(summary.user.id, {
            network: summary.user.username,
            name: `${summary.user.firstName} ${summary.user.lastName}`,
            egamesCommission: 0,
            sportsCommission: 0,
            paymentGatewayFee: 0,
            totalNetCommission: 0,
            deductionsFromGross: 0,
            finalNetCommission: 0,
            userId: summary.user.id,
            parentId: summary.user.parentId,
            isGold: true,
          });
        }

        const userData = goldUserMap.get(summary.user.id);
        if (summary.categoryName.includes("E-Games")) {
          userData.egamesCommission += summary.netGGR || 0;
        } else if (summary.categoryName.includes("Sports Betting")) {
          userData.sportsCommission += summary.netGGR || 0;
        }
        userData.paymentGatewayFee += summary.paymentGatewayFee || 0;
        userData.totalNetCommission +=
          summary.netCommissionAvailablePayout || 0;
        userData.deductionsFromGross += summary.paymentGatewayFee || 0;
        userData.finalNetCommission +=
          summary.netCommissionAvailablePayout || 0;
      });

      goldRows.push(...goldUserMap.values());

      // Add golden total if there are golden rows
      if (goldRows.length > 0) {
        const goldTotal = {
          network: "",
          name: "GOLDEN PARTNER TOTAL",
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
          userId: "golden-total",
          isGoldTotal: true,
        };
        goldRows.push(goldTotal);
      }

      // Set appropriate message based on the role
      let message;
      let code;
      switch (targetRole) {
        case UserRole.SUPER_ADMIN:
          message = "Complete Commission Breakdown fetched successfully";
          code = "2007";
          break;
        case UserRole.OPERATOR:
          message =
            "Platinum and Gold Partner Commission Breakdown fetched successfully";
          code = "2008";
          break;
        case UserRole.PLATINUM:
          message = "Golden Partner Commission Breakdown fetched successfully";
          code = "2009";
          break;
      }

      console.log({ platinumRows, goldRows });

      return {
        code,
        message,
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
          data: {
            platinum: platinumRows,
            golden: goldRows,
          },
        },
      };
    } catch (error) {
      throw new Error(`Error getting commission breakdown: ${error}`);
    }
  }

  public async getLicenseBreakdown(userId: string, roleName: string) {
    try {
      roleName = roleName.toLowerCase();

      // Initialize license data structure
      const licenseData: Record<string, LicenseData> = {
        "E-Games": {
          type: "E-Games",
          ggr: { pending: 0, allTime: 0 },
          commission: { pending: 0, allTime: 0 },
          commissionRate:
            roleName === UserRole.SUPER_ADMIN
              ? SUPER_ADMIN_DEFAULT_COMMISSION_RATES["E-Games"]
              : 0,
        },
        "Sports Betting": {
          type: "Sports Betting",
          betAmount: { pending: 0, allTime: 0 },
          commission: { pending: 0, allTime: 0 },
          commissionRate:
            roleName === UserRole.SUPER_ADMIN
              ? SUPER_ADMIN_DEFAULT_COMMISSION_RATES["Sports Betting"]
              : 0,
        },
        "Speciality Games - Tote": {
          type: "Speciality Games - Tote",
          betAmount: { pending: 0, allTime: 0 },
          commission: { pending: 0, allTime: 0 },
          commissionRate:
            roleName === UserRole.SUPER_ADMIN
              ? SUPER_ADMIN_DEFAULT_COMMISSION_RATES["Speciality Games - Tote"]
              : 0,
        },
        "Speciality Games - RNG": {
          type: "Speciality Games - RNG",
          ggr: { pending: 0, allTime: 0 },
          commission: { pending: 0, allTime: 0 },
          commissionRate:
            roleName === UserRole.SUPER_ADMIN
              ? SUPER_ADMIN_DEFAULT_COMMISSION_RATES["Speciality Games - RNG"]
              : 0,
        },
      };

      // Get all relevant userIds based on role hierarchy
      let userIds = [userId];
      if (roleName === UserRole.SUPER_ADMIN) {
        // For superadmin, get all operators and their children
        const operators = await prisma.user.findMany({
          where: { parentId: userId },
          select: { id: true },
        });
        const operatorIds = operators.map((op) => op.id);

        console.log({ operatorIds });

        userIds = [...userIds, ...operatorIds];

        // Get all platinums under these operators
        const platinums = await prisma.user.findMany({
          where: {
            parentId: { in: operatorIds },
          },
          select: { id: true },
        });
        const platinumIds = platinums.map((p) => p.id);

        console.log({ platinumIds });

        userIds = [...userIds, ...platinumIds];

        // Get all golds under these platinums
        const golds = await prisma.user.findMany({
          where: {
            parentId: { in: platinumIds },
          },
          select: { id: true },
        });
        const goldIds = golds.map((g) => g.id);

        console.log({ goldIds });

        userIds = [...userIds, ...goldIds];
      }
      // else if (roleName === UserRole.OPERATOR) {
      //   // For operator, get all platinums and their children
      //   const platinums = await prisma.user.findMany({
      //     where: {
      //       parentId: userId,
      //       role: { name: UserRole.PLATINUM },
      //     },
      //     select: { id: true },
      //   });
      //   const platinumIds = platinums.map((p) => p.id);

      //   console.log({ platinumIds });

      //   userIds = [...userIds, ...platinumIds];

      //   // Get all golds under these platinums
      //   const golds = await prisma.user.findMany({
      //     where: {
      //       parentId: { in: platinumIds },
      //       role: { name: UserRole.GOLDEN },
      //     },
      //     select: { id: true },
      //   });
      //   const goldIds = golds.map((g) => g.id);

      //   console.log({ goldIds });

      //   userIds = [...userIds, ...goldIds];
      // } else if (roleName === UserRole.PLATINUM) {
      //   // For platinum, get all golds under this platinum
      //   const golds = await prisma.user.findMany({
      //     where: {
      //       parentId: userId,
      //       role: { name: UserRole.GOLDEN },
      //     },
      //     select: { id: true },
      //   });
      //   const goldIds = golds.map((g) => g.id);

      //   console.log({ goldIds });

      //   userIds = [...userIds, ...goldIds];
      // }

      // Use provided date range or default to previous completed cycle
      let cycleStartDate: Date;
      let cycleEndDate: Date;

      // // if (startDate && endDate) {
      //   cycleStartDate = startDate;
      //   cycleEndDate = endDate;
      // } else {
      const dates = await this.getPreviousCompletedCycleDates();
      cycleStartDate = dates.cycleStartDate;
      cycleEndDate = dates.cycleEndDate;

      console.log(
        "📆 Cycle Start Date:",
        cycleStartDate,
        "📆 Cycle End Date:",
        cycleEndDate
      );
      // }

      console.log({ userIds });

      // Get commission records for all relevant users
      const pendingCommissionSummaries =
        await prisma.commissionSummary.findMany({
          where: {
            userId: { in: userIds },
            createdAt: {
              gte: cycleStartDate, // Adjust this date as needed
              lte: cycleEndDate,
            },
            categoryName: {
              in: [
                "E-Games",
                "Sports Betting",
                "Speciality Games - Tote",
                "Speciality Games - RNG",
              ],
            },
          },
        });

      console.log("🔃 Pending commissions: ", pendingCommissionSummaries);

      const settledCommissions = await prisma.commissionSummary.findMany({
        where: {
          userId: { in: userIds },
          settledStatus: "Y",
          categoryName: {
            in: [
              "E-Games",
              "Sports Betting",
              "Speciality Games - Tote",
              "Speciality Games - RNG",
            ],
          },
        },
      });

      // console.log({ commissionSummaries });

      // Get default commission rates for superadmin
      if (roleName === UserRole.SUPER_ADMIN) {
        // First try to get system-wide commission rates
        const defaultCommissions = await prisma.commission.findMany({
          where: {
            commissionPercentage: { gt: 0 },
          },
        });

        // If no system-wide rates found, get commission rates from any operator's assigned site
        if (defaultCommissions.length === 0) {
          const operator = await prisma.user.findFirst({
            where: { role: { name: "operator" } },
            select: { id: true },
          });

          if (operator) {
            const operatorCommissions = await prisma.commission.findMany({
              where: {
                userId: operator.id,
                commissionPercentage: { gt: 0 },
              },
              include: {
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            });
            setCommissionRates(operatorCommissions);
          }
        } else {
          setCommissionRates(defaultCommissions);
        }
      } else {
        // For non-superadmin roles, get commission percentages from their assigned sites
        const commissions = await prisma.commission.findMany({
          where: {
            userId: userId, // the user you're calculating for
          },
          select: {
            userId: true,
            categoryId: true,
            commissionPercentage: true,
            category: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            siteId: "asc", // make sure to order so we can pick the first entry per category
          },
        });

        // Step 2: Filter to only the first site per category manually
        const seenCategories = new Set();
        const filtered = commissions.filter((item) => {
          const key = `${item.userId}-${item.categoryId}`;
          if (seenCategories.has(key)) return false;
          seenCategories.add(key);
          return true;
        });

        const categoryTotals = filtered.reduce((acc, item) => {
          if (!acc[item.categoryId]) {
            acc[item.categoryId] = {
              category: item.categoryId,
              categoryName: item.category.name,
              commissionRate: 0,
            };
          }
          acc[item.categoryId].commissionRate += Number(
            item.commissionPercentage
          );
          return acc;
        }, {});

        const result = Object.values(categoryTotals);

        setCommissionRates(result);
      }

      function setCommissionRates(commissions: any[]) {
        commissions.forEach((comm) => {
          console.log({ comm });
          if (!comm.category) return;
          const categoryName = comm.category.name || comm.categoryName;
          // console.log({ categoryName });
          switch (categoryName) {
            case "E-Games":
              licenseData["E-Games"].commissionRate =
                comm.commissionPercentage || comm.commissionRate;
              break;
            case "Sports Betting":
              licenseData["Sports Betting"].commissionRate =
                comm.commissionPercentage || comm.commissionRate;
              break;
            case "Speciality Games - Tote":
              licenseData["Speciality Games - Tote"].commissionRate =
                comm.commissionPercentage || comm.commissionRate;
              break;
            case "Speciality Games - RNG":
              licenseData["Speciality Games - RNG"].commissionRate =
                comm.commissionPercentage || comm.commissionRate;
              break;
          }
        });
      }

      // Split summaries into pending and settled
      const pendingSummaries = pendingCommissionSummaries.filter(
        (summary) => summary.settledStatus !== "Y"
      );
      // const settledSummaries = settledCommissions.filter(
      //   (summary) => summary.settledStatus === "Y"
      // );

      // console.log({ settledSummaries });

      // Process pending summaries
      pendingSummaries.forEach((summary) => {
        const categoryName = summary.categoryName;
        switch (categoryName) {
          case "E-Games":
            const eGamesData = licenseData["E-Games"];
            if (eGamesData.type === "E-Games") {
              const ggr = summary.netGGR || 0;
              eGamesData.ggr.pending += ggr;
              eGamesData.commission.pending +=
                ggr * (eGamesData.commissionRate / 100);
            }
            break;
          case "Sports Betting":
            const sportsData = licenseData["Sports Betting"];
            if (sportsData.type === "Sports Betting") {
              const betAmount = summary.totalBetAmount || 0;
              sportsData.betAmount.pending += betAmount;
              sportsData.commission.pending +=
                betAmount * (sportsData.commissionRate / 100);
            }
            break;
          case "Speciality Games - Tote":
            const toteData = licenseData["Speciality Games - Tote"];
            if (toteData.type === "Speciality Games - Tote") {
              const betAmount = summary.totalBetAmount || 0;
              toteData.betAmount.pending += betAmount;
              toteData.commission.pending +=
                betAmount * (toteData.commissionRate / 100);
            }
            break;
          case "Speciality Games - RNG":
            const rngData = licenseData["Speciality Games - RNG"];
            if (rngData.type === "Speciality Games - RNG") {
              const ggr = summary.netGGR || 0;
              rngData.ggr.pending += ggr;
              rngData.commission.pending +=
                ggr * (rngData.commissionRate / 100);
            }
            break;
        }
      });

      // Process settled summaries
      settledCommissions.forEach((summary) => {
        const categoryName = summary.categoryName;
        switch (categoryName) {
          case "E-Games":
            const eGamesData = licenseData["E-Games"];
            if (eGamesData.type === "E-Games") {
              const ggr = summary.netGGR || 0;
              eGamesData.ggr.allTime += ggr;
              eGamesData.commission.allTime +=
                ggr * (eGamesData.commissionRate / 100);
            }
            break;
          case "Sports Betting":
            const sportsData = licenseData["Sports Betting"];
            if (sportsData.type === "Sports Betting") {
              const betAmount = summary.totalBetAmount || 0;
              sportsData.betAmount.allTime += betAmount;
              sportsData.commission.allTime +=
                betAmount * (sportsData.commissionRate / 100);
            }
            break;
          case "Speciality Games - Tote":
            const toteData = licenseData["Speciality Games - Tote"];
            if (toteData.type === "Speciality Games - Tote") {
              const betAmount = summary.totalBetAmount || 0;
              toteData.betAmount.allTime += betAmount;
              toteData.commission.allTime +=
                betAmount * (toteData.commissionRate / 100);
            }
            break;
          case "Speciality Games - RNG":
            const rngData = licenseData["Speciality Games - RNG"];
            if (rngData.type === "Speciality Games - RNG") {
              const ggr = summary.netGGR || 0;
              rngData.ggr.allTime += ggr;
              rngData.commission.allTime +=
                ggr * (rngData.commissionRate / 100);
            }
            break;
        }
      });

      // Return response structure
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
                label:
                  data.type === "E-Games" ||
                  data.type === "Speciality Games - RNG"
                    ? "GGR"
                    : "Total Bet Amount",
                pendingSettlement:
                  data.type === "E-Games" ||
                  data.type === "Speciality Games - RNG"
                    ? data.ggr.pending
                    : data.betAmount.pending,
                settledAllTime:
                  data.type === "E-Games" ||
                  data.type === "Speciality Games - RNG"
                    ? data.ggr.allTime
                    : data.betAmount.allTime,
              },
              {
                label: "Commission Rate",
                value: `${data.commissionRate}%`,
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
      case UserRole.SUPER_ADMIN:
        directChildren = await prisma.user.findMany({
          where: { role: { name: UserRole.OPERATOR } },
          select: { id: true },
        });
        break;
      case UserRole.OPERATOR:
        directChildren = await prisma.user.findMany({
          where: {
            parentId: userId,
            role: { name: UserRole.PLATINUM },
          },
          select: { id: true },
        });
        break;
      case UserRole.PLATINUM:
        directChildren = await prisma.user.findMany({
          where: {
            parentId: userId,
            role: { name: UserRole.GOLDEN },
          },
          select: { id: true },
        });
        break;
    }

    // Add direct children IDs
    childIds = directChildren.map((child) => child.id);

    // Recursively get grandchildren for operator role
    if (roleName === UserRole.OPERATOR) {
      for (const child of directChildren) {
        const grandChildren = await prisma.user.findMany({
          where: {
            parentId: child.id,
            role: { name: UserRole.GOLDEN },
          },
          select: { id: true },
        });
        childIds = [...childIds, ...grandChildren.map((gc) => gc.id)];
      }
    }

    return childIds;
  }

  public async getAllUnSettledCommissionSummary() {
    try {
      // Using the instance variable instead of creating a new instance
      const commissionData =
        await this.commissionDao.getUnsettledCommissionSummaries();
      return commissionData;
    } catch (error) {
      throw new Error(`Error creating commission: ${error}`);
    }
  }

  public async markCommissionSummaryStatus(ids: string[]) {
    try {
      // Using the instance variable instead of creating a new instance
      const commissionData =
        await this.commissionDao.markCommissionAsSettled(ids);
      return commissionData;
    } catch (error) {
      throw new Error(`Error creating commission: ${error}`);
    }
  }

  public async getSettledCommissionReports(
    userId: string,
    roleName: string,
    startDate?: Date,
    endDate?: Date,
    downlineId?: string
  ) {
    try {
      // Determine the immediate downline role based on the logged-in user's role
      let downlineRole: string;
      roleName = roleName.toLowerCase();

      switch (roleName) {
        case UserRole.SUPER_ADMIN:
          downlineRole = UserRole.OPERATOR;
          break;
        case UserRole.OPERATOR:
          downlineRole = UserRole.PLATINUM;
          break;
        case UserRole.PLATINUM:
          downlineRole = UserRole.GOLDEN;
          break;
        default:
          throw new Error(
            "Unauthorized. Only superadmin, operator, and platinum users can access settled commission reports."
          );
      }

      // Get immediate downlines of the user
      let downlineUsers;
      if (downlineId) {
        // If downlineId is provided, verify that it's a valid immediate downline
        downlineUsers = await prisma.user.findMany({
          where: {
            id: downlineId,
            parentId: userId,
            role: {
              name: downlineRole,
            },
          },
          select: {
            id: true,
            username: true,
          },
        });

        if (downlineUsers.length === 0) {
          throw new Error(
            `Invalid downline ID or not an immediate downline of the current user.`
          );
        }
      } else {
        // Get all immediate downlines
        downlineUsers = await prisma.user.findMany({
          where: {
            parentId: userId,
            role: {
              name: downlineRole,
            },
          },
          select: {
            id: true,
            username: true,
          },
        });
      }

      if (downlineUsers.length === 0) {
        return {
          reports: [],
          message: "No downline users found.",
        };
      }

      // Get the current date to cap report end dates
      const currentDate = new Date();

      // If startDate and endDate are not provided, find the earliest and latest settled commission dates
      if (!startDate || !endDate) {
        // Get the earliest and latest settled dates for the downline users
        const downlineIds = downlineUsers.map((user) => user.id);

        const earliestSettlementRecord =
          await prisma.commissionSummary.findFirst({
            where: {
              userId: { in: downlineIds },
              settledStatus: "Y",
              settledAt: { not: null },
            },
            orderBy: {
              settledAt: "asc",
            },
            select: {
              settledAt: true,
            },
          });

        const latestSettlementRecord = await prisma.commissionSummary.findFirst(
          {
            where: {
              userId: { in: downlineIds },
              settledStatus: "Y",
              settledAt: { not: null },
            },
            orderBy: {
              settledAt: "desc",
            },
            select: {
              settledAt: true,
            },
          }
        );

        // If no settled commissions found, use current cycle dates
        if (!earliestSettlementRecord || !latestSettlementRecord) {
          const { cycleStartDate, cycleEndDate } =
            await this.getCurrentCycleDates();
          startDate = cycleStartDate;
          // Cap the end date to the current date
          endDate = new Date(
            Math.min(cycleEndDate.getTime(), currentDate.getTime())
          );

          return {
            reports: [],
            message: "No settled commission reports found.",
          };
        }

        // Use earliest and latest settlement dates
        startDate = earliestSettlementRecord.settledAt;
        endDate = latestSettlementRecord.settledAt;
      }

      // Validate date inputs (should be already validated in controller, but double-check)
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format. Please use YYYY-MM-DD format.");
      }

      // For each downline, get their settled commission summaries grouped by date periods
      const reportsPromises = downlineUsers.map(async (downline) => {
        const summaries = await prisma.commissionSummary.findMany({
          where: {
            userId: downline.id,
            settledStatus: "Y",
            settledAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: {
            settledAt: "asc",
          },
        });

        if (summaries.length === 0) {
          return [];
        }

        // Group by period (fromDate, toDate)
        const groupedByPeriod = new Map();

        for (const summary of summaries) {
          // Determine the period based on bi-monthly or monthly cycle
          let fromDate, toDate;
          const settledAt = summary.settledAt || summary.createdAt;

          // For bi-monthly periods
          if (DEFAULT_COMMISSION_COMPUTATION_PERIOD === "BI_MONTHLY") {
            const day = settledAt.getDate();
            if (day <= 15) {
              // First half of the month
              fromDate = new Date(
                settledAt.getFullYear(),
                settledAt.getMonth(),
                1
              );
              toDate = new Date(
                settledAt.getFullYear(),
                settledAt.getMonth(),
                15
              );
            } else {
              // Second half of the month
              fromDate = new Date(
                settledAt.getFullYear(),
                settledAt.getMonth(),
                16
              );
              toDate = lastDayOfMonth(settledAt);
            }
          } else {
            // For monthly periods
            fromDate = startOfMonth(settledAt);
            toDate = lastDayOfMonth(settledAt);
          }

          // Cap end date to current date for incomplete cycles
          if (toDate > currentDate) {
            toDate = new Date(currentDate);
          }

          const periodKey = `${fromDate.toISOString()}-${toDate.toISOString()}`;

          if (!groupedByPeriod.has(periodKey)) {
            groupedByPeriod.set(periodKey, {
              fromDate,
              toDate,
              downlineId: downline.id,
              downlineName: downline.username,
              summaries: [],
            });
          }

          groupedByPeriod.get(periodKey).summaries.push(summary);
        }

        // Convert grouped data to the required report format
        return Array.from(groupedByPeriod.values()).map((group, index) => ({
          id: index + 1, // Generate a unique ID for each group
          fromDate: format(group.fromDate, "M-dd-yyyy"),
          toDate: format(group.toDate, "M-dd-yyyy"),
          downlineName: group.downlineName,
          status: "COMPLETED",
          action: "DOWNLOAD",
          // Store additional data for download
          _metadata: {
            downlineId: group.downlineId,
            fromDateISO: group.fromDate.toISOString(),
            toDateISO: group.toDate.toISOString(),
          },
        }));
      });

      const reportsArrays = await Promise.all(reportsPromises);
      const reports = reportsArrays.flat();

      return {
        reports,
        message:
          reports.length > 0
            ? "Settled commission reports fetched successfully."
            : "No settled commission reports found for the specified criteria.",
      };
    } catch (error) {
      throw new Error(
        `Error fetching settled commission reports: ${error.message}`
      );
    }
  }

  // Helper method to get current cycle dates
  private async getCurrentCycleDates() {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    let cycleStartDate: Date;
    let cycleEndDate: Date;

    if (DEFAULT_COMMISSION_COMPUTATION_PERIOD.toString() === "MONTHLY") {
      // Monthly cycle: 1st to last day of month
      cycleStartDate = startOfMonth(currentDate);
      cycleEndDate = endOfMonth(currentDate);
    } else {
      // Bi-monthly cycle: 1-15 or 16-end of month
      if (currentDay <= 15) {
        // First half of month
        cycleStartDate = startOfMonth(currentDate);
        cycleEndDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          15
        );
      } else {
        // Second half of month
        cycleStartDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          16
        );
        cycleEndDate = endOfMonth(currentDate);
      }
    }

    return { cycleStartDate, cycleEndDate };
  }

  public async downloadSettledCommissionReport(
    userId: string,
    roleName: string,
    fromDate: Date,
    toDate: Date,
    downlineId: string
  ) {
    try {
      // Validate parameters
      if (!downlineId || !fromDate || !toDate) {
        throw new Error("Missing required parameters for report download.");
      }

      // Determine the immediate downline role based on the logged-in user's role
      let downlineRole: string;
      roleName = roleName.toLowerCase();

      switch (roleName) {
        case UserRole.SUPER_ADMIN:
          downlineRole = UserRole.OPERATOR;
          break;
        case UserRole.OPERATOR:
          downlineRole = UserRole.PLATINUM;
          break;
        case UserRole.PLATINUM:
          downlineRole = UserRole.GOLDEN;
          break;
        default:
          throw new Error(
            "Unauthorized. Only superadmin, operator, and platinum users can access settled commission reports."
          );
      }

      // Verify that the downline is a valid immediate downline of the user
      const downline = await prisma.user.findFirst({
        where: {
          id: downlineId,
          parentId: userId,
          role: {
            name: downlineRole,
          },
        },
        include: {
          role: true,
        },
      });

      if (!downline) {
        throw new Error(
          "Invalid downline ID or not an immediate downline of the current user."
        );
      }

      // Get all settled commission summaries for the specified downline and date range
      const summaries = await prisma.commissionSummary.findMany({
        where: {
          userId: downlineId,
          settledStatus: "Y",
          settledAt: {
            gte: fromDate,
            lte: toDate,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          role: true,
        },
      });

      if (summaries.length === 0) {
        throw new Error("No commission data found for the specified criteria.");
      }

      // Generate CSV content
      const csvRows = [
        "User ID,User Name,Role,Commission Amount,Settlement Date,Downline Name,Downline Role,From Date,To Date,Status",
      ];

      summaries.forEach((summary) => {
        const row = [
          summary.userId,
          summary.user
            ? `${summary.user.firstName} ${summary.user.lastName}`
            : "Unknown",
          summary.role ? summary.role.name : "Unknown",
          summary.netCommissionAvailablePayout,
          summary.settledAt
            ? format(summary.settledAt, "yyyy-MM-dd")
            : format(summary.createdAt, "yyyy-MM-dd"),
          downline.username,
          downline.role.name,
          format(fromDate, "yyyy-MM-dd"),
          format(toDate, "yyyy-MM-dd"),
          "COMPLETED",
        ];

        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");

      return {
        filename: `settled_commission_${downline.username}_${format(fromDate, "yyyyMMdd")}_${format(toDate, "yyyyMMdd")}.csv`,
        content: csvContent,
      };
    } catch (error) {
      throw new Error(
        `Error generating commission report CSV: ${error.message}`
      );
    }
  }

  public async getCommissionBreakdownForDownLoadReport(
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

      // Get summaries for platinums
      const platinumSummaries = await prisma.commissionSummary.findMany({
        where: {
          settledStatus: "Y",
          // createdAt: {
          //   gte: cycleStartDate,
          //   lte: cycleEndDate,
          // },
          role: {
            name: "platinum",
          },
          user: {
            parentId: effectiveUserId,
          },
        },
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

      // Get summaries for golds
      const goldSummaries = await prisma.commissionSummary.findMany({
        where: {
          settledStatus: "Y",
          // createdAt: {
          //   gte: cycleStartDate,
          //   lte: cycleEndDate,
          // },
          role: {
            name: "gold",
          },
          user: {
            parentId: effectiveUserId,
          },
          // user: {
          //   parent: {
          //     parentId: effectiveUserId, // This ensures we get golds under the platinums of the operator
          //   },
          // },
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

      // Process platinum data
      const platinumRows = [];
      const platinumUserMap = new Map();

      platinumSummaries.forEach((summary) => {
        if (!platinumUserMap.has(summary.user.id)) {
          platinumUserMap.set(summary.user.id, {
            network: summary.user.username,
            name: `${summary.user.firstName} ${summary.user.lastName}`,
            egamesCommission: 0,
            sportsCommission: 0,
            paymentGatewayFee: 0,
            totalNetCommission: 0,
            deductionsFromGross: 0,
            finalNetCommission: 0,
            userId: summary.user.id,
            isPlatinum: true,
          });
        }

        const userData = platinumUserMap.get(summary.user.id);
        if (summary.categoryName.toLowerCase().includes("egames")) {
          userData.egamesCommission += summary.netGGR || 0;
        } else if (summary.categoryName.toLowerCase().includes("sports")) {
          userData.sportsCommission += summary.netGGR || 0;
        }
        userData.paymentGatewayFee += summary.paymentGatewayFee || 0;
        userData.totalNetCommission +=
          summary.netCommissionAvailablePayout || 0;
        userData.deductionsFromGross += summary.paymentGatewayFee || 0;
        userData.finalNetCommission +=
          summary.netCommissionAvailablePayout || 0;
      });

      platinumRows.push(...platinumUserMap.values());

      // Add platinum total if there are platinum rows
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

      // Process gold data
      const goldRows = [];
      const goldUserMap = new Map();

      goldSummaries.forEach((summary) => {
        if (!goldUserMap.has(summary.user.id)) {
          goldUserMap.set(summary.user.id, {
            network: summary.user.username,
            name: `${summary.user.firstName} ${summary.user.lastName}`,
            egamesCommission: 0,
            sportsCommission: 0,
            paymentGatewayFee: 0,
            totalNetCommission: 0,
            deductionsFromGross: 0,
            finalNetCommission: 0,
            userId: summary.user.id,
            parentId: summary.user.parentId,
            isGold: true,
          });
        }

        const userData = goldUserMap.get(summary.user.id);
        if (summary.categoryName.toLowerCase().includes("egames")) {
          userData.egamesCommission += summary.netGGR || 0;
        } else if (summary.categoryName.toLowerCase().includes("sports")) {
          userData.sportsCommission += summary.netGGR || 0;
        }
        userData.paymentGatewayFee += summary.paymentGatewayFee || 0;
        userData.totalNetCommission +=
          summary.netCommissionAvailablePayout || 0;
        userData.deductionsFromGross += summary.paymentGatewayFee || 0;
        userData.finalNetCommission +=
          summary.netCommissionAvailablePayout || 0;
      });

      goldRows.push(...goldUserMap.values());

      // Add gold total if there are gold rows
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

      // Set appropriate message based on the role
      let message;
      let code;
      switch (targetRole) {
        case "superadmin":
          message = "Complete Commission Breakdown fetched successfully";
          code = "2007";
          break;
        case "operator":
          message =
            "Platinum and Gold Partner Commission Breakdown fetched successfully";
          code = "2008";
          break;
        case "platinum":
          message = "Golden Partner Commission Breakdown fetched successfully";
          code = "2009";
          break;
      }

      return {
        code,
        message,
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
          data: {
            platinum: platinumRows,
            gold: goldRows,
          },
        },
      };
    } catch (error) {
      throw new Error(`Error getting commission breakdown: ${error}`);
    }
  }
}

export { CommissionService };
