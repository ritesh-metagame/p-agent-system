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

  public async getCommissionPayoutReport(
    userId: string,
    categoryId?: string,
    userRole?: string
  ) {
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
          // On or after the 16th, show the first half of the current month (1-15)
          cycleStartDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          // Make sure the date is exactly the 15th at 23:59:59.999
          cycleEndDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            15
          );
          cycleEndDate.setHours(23, 59, 59, 999);
        } else {
          // Before the 16th, show the second half of the previous month (16-end)
          const prevMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1
          );
          cycleStartDate = new Date(
            prevMonth.getFullYear(),
            prevMonth.getMonth(),
            15
          );
          cycleEndDate = endOfMonth(prevMonth);
        }

        console.log("Bi-monthly cycle calculation details:", {
          currentDay,
          isSecondHalf: currentDay >= 16,
          cycleStartDate: cycleStartDate.toISOString(),
          cycleEndDate: cycleEndDate.toISOString(),
          cycleStartDateLocalString: cycleStartDate.toString(),
          cycleEndDateLocalString: cycleEndDate.toString(),
        });
      }

      // Use UTC hours for consistent date comparison
      cycleStartDate.setUTCHours(0, 0, 0, 0);
      cycleEndDate.setUTCHours(23, 59, 59, 999);

      console.log("Date range being used:", {
        cycleStartDate: cycleStartDate.toISOString(),
        cycleEndDate: cycleEndDate.toISOString(),
        currentDay,
        userRole,
      });

      // Get user and role information
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user || !user.role) {
        throw new Error("User or role information not found");
      }

      const roleName = userRole || user.role.name.toLowerCase();
      console.log(`Processing report for user ${userId} with role ${roleName}`);

      // Format dates for response
      const pendingPeriod = {
        start: format(cycleStartDate, "yyyy-MM-dd"),
        end: format(cycleEndDate, "yyyy-MM-dd"),
      };

      // Handle different roles and their hierarchical data access
      let commissionData;
      let userIds = [userId]; // Default to just the current user

      if (roleName === "superadmin") {
        // For superadmin, find all operators
        const operators = await prisma.user.findMany({
          where: {
            role: {
              name: {
                equals: "operator",
                // mode: 'insensitive'
              },
            },
          },
          select: { id: true },
        });

        userIds = operators.map((op) => op.id);
        console.log(
          `Superadmin: Found ${userIds.length} operators to include in report`
        );
      } else if (roleName === "operator") {
        // For operator, find all platinum users under them
        const platinums = await prisma.user.findMany({
          where: {
            parentId: userId,
            role: {
              name: {
                equals: "platinum",
                // mode: "insensitive",
              },
            },
          },
          select: { id: true },
        });

        userIds = platinums.map((p) => p.id);
        console.log(
          `Operator: Found ${userIds.length} platinum users to include in report`
        );
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

      console.log(`Data check for role ${roleName}: Found data = ${!!anyData}`);

      // If no data found, return empty report with message
      if (!anyData && userIds.length > 0) {
        console.log(
          `No commission data found for the ${roleName} role during this period`
        );

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
          overview: [
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
          ],
          breakdownPerGame: {
            eGames: [
              // ... same metrics as overview
            ],
            "Sports-Betting": [
              // ... same metrics as overview
            ],
          },
        };
      }

      // Get commission data for the applicable users
      // This replaces the call to this.commissionDao.getCommissionPayoutReport
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

      const categories = await prisma.category.findMany();

      console.log("Found pending settlements:", pendingSettlements.length);
      console.log("Found all-time data entries:", allTimeData.length);

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
        const gameCategoryMap = new Map(
          categories.map((c) => [c.name.toLowerCase(), c.name])
        );

        // Process each game category
        for (const categoryName of gameCategories) {
          console.log(`Looking for data for category: ${categoryName}`);

          const pendingData = pendingSettlements.find(
            (s) => s.categoryName.toLowerCase() === categoryName.toLowerCase()
          )?._sum;

          const allTimeDataForCategory = allTimeData.find(
            (s) => s.categoryName.toLowerCase() === categoryName.toLowerCase()
          )?._sum;

          console.log(`Found data for ${categoryName}:`, {
            pendingData: pendingData || "none",
            allTimeData: allTimeDataForCategory || "none",
          });

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
}

export { CommissionService };
