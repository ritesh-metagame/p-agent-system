import {Service} from "typedi";
import {Commission, User} from "../../prisma/generated/prisma";
import {CommissionDao} from "../daos/commission.dao";
import {RoleDao} from "../daos/role.dao";
import {GenerateCommission} from "../daos/generateCommission";
import {prisma} from "../server";
import {
    CommissionComputationPeriod,
    DEFAULT_COMMISSION_COMPUTATION_PERIOD,
    UserRole,
} from "../common/config/constants";

import {
    addDays,
    differenceInDays,
    endOfMonth, endOfWeek,
    format,
    getDaysInMonth,
    lastDayOfMonth,
    setDate,
    startOfMonth, startOfWeek,
    subMonths,
} from "date-fns";
import {ResponseCodes} from "../common/config/responseCodes";
import {Response} from "../common/config/response";
import UserDao from "../daos/user.dao";
import logger from "../common/logger";
import {publicEncrypt} from "crypto";
import {GenerateCompletedCycleCommission} from "../daos/generateCompletedCycleSummary";
import Decimal from "decimal.js";

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

// always HALF-UP to 5 places, return a plain number
export const fmt = (val: Decimal | number) =>
    new Decimal(val).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

@Service()
class CommissionService {
    private commissionDao: CommissionDao;
    private roleDao: RoleDao;
    private commissionSummaryDao: GenerateCommission; // Assuming you have a CommissionSummaryDao
    private userDao: UserDao;
    private completedCommissionSummaryDao: GenerateCompletedCycleCommission

    constructor() {
        this.commissionDao = new CommissionDao();
        this.roleDao = new RoleDao();
        this.commissionSummaryDao = new GenerateCommission(); // Initialize the commission summary DAO
        this.completedCommissionSummaryDao = new GenerateCompletedCycleCommission(); // Initialize the completed commission summary DAO
        this.userDao = new UserDao();
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

    public async generateCompletedCyclesSummary(startDate: string, endDate: string, category: string) {
        try {
            // Using the instance variable instead of creating a new instance
            const sDate = new Date(startDate);
            const eDate = new Date(endDate);

            const categoryMap = {
                egames: 'E-Games',
                sportsbetting: 'Sports Betting',
                specialitygamesrng: 'Speciality Games - RNG',
                specialitygamestote: 'Speciality Games - Tote',
            }

            const newCommission =
                await this.completedCommissionSummaryDao.completeCycle(
                    sDate,
                    eDate,
                    categoryMap[category.toLowerCase()]
                );
            return newCommission;
        } catch (error) {
            throw new Error(`Error creating commission: ${error}`);
        }
    }


    public async getCommissionByUserId(
        userId: string,
        categoryId?: string
    ): Promise<Response> {
        try {
            const commission = await this.commissionDao.getCommissionByUserId(userId);

            return new Response(
                ResponseCodes.USER_COMMISSION_FETCHED_SUCCESSFULLY.code,
                ResponseCodes.USER_COMMISSION_FETCHED_SUCCESSFULLY.message,
                commission
            );

            // return commission;
        } catch (error) {
            throw new Error(`Error fetching commission by user ID: ${error}`);
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
            const userIds = [userId];

            // Get the user role
            const user = await prisma.user.findUnique({
                where: {id: userId},
                select: {role: {select: {name: true}}},
            });

            const userRole = user?.role.name.toLowerCase();

            if (userRole === UserRole.OPERATOR) {
                // Get all platinums under this operator
                const platinums = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {name: UserRole.PLATINUM},
                    },
                    select: {id: true},
                });
                userIds.push(...platinums.map((platinum) => platinum.id));

                const goldens = await prisma.user.findMany({
                    where: {
                        parentId: {in: platinums.map((platinum) => platinum.id)},
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
                });
                userIds.push(...goldens.map((golden) => golden.id));
            }

            // Get the category name for the categoryId if provided
            let categoryName: string | undefined;
            if (categoryId) {
                const category = await prisma.category.findUnique({
                    where: {id: categoryId},
                    select: {name: true},
                });
                categoryName = category?.name;
            }

            // Calculate the date range for the previously completed cycle based on category
            const {cycleStartDate, cycleEndDate} =
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
                // Get the cycle dates specific to this category
                const categoryCycleDates =
                    await this.getPreviousCompletedCycleDates(category);

                // Get commission data for pending settlements
                const pendingSettlements = await prisma.commissionSummary.findMany({
                    where: {
                        userId: {in: userIds},
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

                // Get all-time data for the category
                const allTimeData = await prisma.commissionSummary.findMany({
                    where: {
                        userId: {in: userIds},
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

                const settledPaymentGatewayFees = await this.getPaymentGatewayFee(
                    [userId],
                    true,
                    undefined,
                    undefined
                );

                const pendingPaymentGatewayFees = await this.getPaymentGatewayFee(
                    [userId],
                    false,
                    categoryCycleDates.cycleStartDate,
                    categoryCycleDates.cycleEndDate
                );

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
                            acc.paymentGatewayFee + (pendingPaymentGatewayFees || 0),
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
                            acc.paymentGatewayFee + (settledPaymentGatewayFees || 0),
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

    public async getRunningTally(
        userId: string,
        userRole: string,
        timestamp: Date
    ) {
        try {
            const categories = [
                "E-Games",
                "Sports Betting",
                "Speciality Games - RNG",
                "Speciality Games - Tote",
            ];

            // Get all commission records based on role
            let commissionSummaries = []

            let result;

            for (const category of categories) {
                const {cycleStartDate, cycleEndDate} =
                    this.getRunningTallyPeriodStartDate(category);

                console.log("Running tally date range:", {
                    startDate: cycleStartDate,
                    endDate: cycleEndDate,
                    category,
                });

                switch (userRole) {
                    case UserRole.SUPER_ADMIN:

                        const userIds = []

                        // const userIds = await this.getDescendantUserIds([userId], [UserRole.OPERATOR, UserRole.PLATINUM, UserRole.GOLDEN])

                        const oIds = await prisma.user.findMany({
                            where: {
                                parentId: userId,
                                role: {
                                    name: UserRole.OPERATOR
                                }
                            },
                            select: {
                                id: true
                            }
                        }).then((docs) => docs.map(doc => doc.id))

                        const pIds = await prisma.user.findMany({
                            where: {
                                parentId: {
                                    in: oIds
                                },
                                role: {
                                    name: UserRole.PLATINUM
                                }
                            },
                            select: {
                                id: true
                            }
                        }).then((docs) => docs.map((doc) => doc.id))

                        const gIds = await prisma.user.findMany({
                            where: {
                                parentId: {
                                    in: pIds
                                },
                                role: {
                                    name: UserRole.GOLDEN
                                }
                            },
                            select: {
                                id: true
                            }
                        }).then((docs) => docs.map((doc) => doc.id))

                        userIds.push(...oIds, ...pIds, ...gIds)

                        // Get all children summaries

                        // const superadminSummaries = await this.getCommissionSummariesForUserIds(
                        //     cycleStartDate,
                        //     cycleEndDate,
                        //     category,
                        //     userIds
                        // )

                        const superadminSummaries = await prisma.commissionSummary.findMany({
                            where: {
                                createdAt: {
                                    gte: cycleStartDate,
                                    lte: cycleEndDate,
                                },
                                categoryName: category,
                                userId: {
                                    in: userIds
                                }
                            },
                            select: {
                                netCommissionAvailablePayout: true,
                                categoryName: true,
                                createdAt: true
                            },
                        });
                        commissionSummaries.push(...superadminSummaries);
                        // console.log("Commission summaries for superadmin:", commissionSummaries);
                        break;

                    case UserRole.OPERATOR:
                        // Get direct platinum summaries
                        // const operatorSummaries = await this.getCommissionSummariesForUserIds(
                        //     cycleStartDate,
                        //     cycleEndDate,
                        //     category,
                        //     [userId]
                        // )
                        const operatorSummaries = await prisma.commissionSummary.findMany({
                            where: {
                                createdAt: {
                                    gte: cycleStartDate,
                                    lte: cycleEndDate,
                                },
                                categoryName: category,
                                user: {
                                    id: userId,
                                },
                            },
                            include: {
                                user: true,
                                role: true,
                            },
                        });
                        commissionSummaries.push(...operatorSummaries);
                        break;

                    case UserRole.PLATINUM:
                        // Get direct agent summaries
                        // const platinumSummaries = await this.getCommissionSummariesForUserIds(
                        //     cycleStartDate,
                        //     cycleEndDate,
                        //     category,
                        //     [userId]
                        // )
                        const platinumSummaries = await prisma.commissionSummary.findMany({
                            where: {
                                createdAt: {
                                    gte: cycleStartDate,
                                    lte: cycleEndDate,
                                },
                                categoryName: category,
                                user: {
                                    id: userId,
                                },
                            },
                            include: {
                                user: true,
                                role: true,
                            },
                        });
                        commissionSummaries.push(...platinumSummaries);
                        break;

                    case UserRole.GOLDEN:
                        // Get own summaries
                        // const goldenSummaries = await this.getCommissionSummariesForUserIds(
                        //     cycleStartDate,
                        //     cycleEndDate,
                        //     category,
                        //     [userId]
                        // )
                        const goldenSummaries = await prisma.commissionSummary.findMany({
                            where: {
                                createdAt: {
                                    gte: cycleStartDate,
                                    lte: cycleEndDate,
                                },
                                categoryName: category,
                                userId: userId,
                            },
                            include: {
                                user: true,
                                role: true,
                            },
                        });
                        commissionSummaries.push(...goldenSummaries);
                        break;

                    default:
                        throw new Error("Invalid role specified");
                }
                // Group summaries by game category
                const gameCategories = ["E-Games", "Sports-Betting"];
                result = {
                    columns: [
                        "",
                        "E-GAMES COMMISSION AS OF TODAY",
                        "SPORTS BETTING COMMISSION AS OF TODAY",
                    ],
                    roleLabel: this.getRoleLabelForUser(userRole),
                    tally: [
                        {
                            metric: "Commission Available for Payout",
                            eGames: 0,
                            sportsBetting: 0,
                            specialityGamesTote: 0,
                            specialityGamesRNG: 0,
                        },
                    ],
                    from: cycleStartDate.toISOString(),
                    to: cycleEndDate.toISOString(),
                };
            }

            // console.log({commissionSummaries})

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
                } else if (summary.categoryName === "Speciality Games - RNG") {
                    result.tally[0].specialityGamesRNG += Number(
                        summary.netCommissionAvailablePayout || 0
                    );
                } else if (summary.categoryName === "Speciality Games - Tote") {
                    result.tally[0].specialityGamesTote += Number(
                        summary.netCommissionAvailablePayout || 0
                    );
                }
            });

            return result;
        } catch (error) {
            throw new Error(`Error getting running commission tally: ${error}`);
        }
    }

    public async getTotalCommissionByUser(userId: string) {
        try {
            const categoryCycles = {
                "E-Games": "BI_MONTHLY",
                "Speciality Games - RNG": "BI_MONTHLY",
                "Sports Betting": "BI_WEEKLY",
                "Speciality Games - Tote": "BI_WEEKLY",
            };

            for (const [category, cycleType] of Object.entries(categoryCycles)) {
                const cycleDates = await this.getPreviousCompletedCycleDates(category);
                // console.log(`Category: ${category}, Cycle Type: ${cycleType}, Dates:`, cycleDates);
            }

            // Using the instance variable instead of creating a new instance
            // Get the logged-in user and their role
            const loggedInUser = await prisma.user.findUnique({
                where: {id: userId},
                include: {
                    role: true,
                    children: {
                        include: {role: true},
                    },
                },
            });

            let userIds = [userId];

            if (!loggedInUser || !loggedInUser.role) {
                throw new Error("User or user role not found.");
            }

            const {cycleStartDate, cycleEndDate} =
                await this.getPreviousCompletedCycleDates();

            const roleName = loggedInUser.role.name.toLowerCase() as UserRole;
            let allowedRole = "" as UserRole;

            let settledOids = [];
            let settledPids = [];
            let settledGids = [];

            let oIds = [];
            let pIds = [];
            let gIds = [];

            let settledSummaries = [];

            let pendingPaymentGatewayFee = 0;
            let settledPaymentGatewayFee = 0;

            const groupIds = []

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

                oIds = oChildensIds

                const pChildrens = await prisma.user.findMany({
                    where: {
                        parentId: {in: oChildensIds},
                    },
                    select: {
                        id: true,
                        parentId: true
                    },
                });

                const pChildrensIds = pChildrens.map((child) => child.id);

                pIds = pChildrensIds

                userIds = [...userIds, ...pChildrensIds];

                const gChildrens = await prisma.user.findMany({
                    where: {
                        parentId: {in: pChildrensIds},
                    },
                    select: {
                        id: true,
                        parentId: true
                    },
                });
                const gChildrensIds = gChildrens.map((child) => child.id);

                gIds = gChildrensIds

                userIds = [...userIds, ...gChildrensIds];

                const settledData = await prisma.settlementHistory.findMany({
                    where: {
                        userId: {in: oChildensIds},
                        isPartiallySettled: false,
                    },
                    select: {
                        userId: true,
                        amount: true
                    },
                });

                const settledUserIds = settledData.map((data) => data.userId);

                settledOids = settledUserIds;

                // Fetch non-settled data for operators and their hierarchy
                // Check if there are any non-settled data for the same users

                const nonSettledPlatinumChildren = await prisma.user.findMany({
                    where: {
                        parentId: {in: settledUserIds},
                        role: {name: UserRole.PLATINUM},
                    },
                    select: {id: true},
                });

                settledPids = nonSettledPlatinumChildren.map((platinum) => platinum.id);

                const nonSettledGoldenChildren = await prisma.user.findMany({
                    where: {
                        parentId: {
                            in: nonSettledPlatinumChildren.map((platinum) => platinum.id),
                        },
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
                });

                settledGids = nonSettledGoldenChildren.map((golden) => golden.id);

                if (settledData.length !== 0) {
                    const settledDataForNonSettled =
                        await prisma.settlementHistory.findMany({
                            where: {
                                userId: {
                                    in: [
                                        ...nonSettledPlatinumChildren.map((ch) => ch.id),
                                        ...nonSettledGoldenChildren.map((ch) => ch.id),
                                    ],
                                },
                                isPartiallySettled: true,
                                isPartiallySettledBySuperAdmin: true
                            },
                            select: {
                                userId: true,
                                amount: true
                            },
                        });

                    settledData.push(...(settledDataForNonSettled as any));

                    // console.log("Settled Data:", settledData);

                    settledSummaries = settledData;
                }
            }
            if (roleName === UserRole.OPERATOR) {
                const platinums = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {name: UserRole.PLATINUM},
                    },
                    select: {id: true},
                });

                userIds = platinums.map((platinum) => platinum.id);

                pIds = platinums.map((platinum) => platinum.id);

                const goldens = await prisma.user.findMany({
                    where: {
                        parentId: {in: platinums.map((platinum) => platinum.id)},
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true, parentId: true},
                });


                userIds = userIds.concat(goldens.map((golden) => golden.id));

                gIds = goldens.map((golden) => golden.id)
                // Fetch settled data for platinums and their hierarchy
                const settledData = await prisma.settlementHistory.findMany({
                    where: {
                        userId: {in: platinums.map((platinum) => platinum.id)},
                        isPartiallySettled: false,
                    },
                    select: {
                        userId: true,
                        amount: true,
                    },
                });

                console.log({settledData})

                const settledUserIds = settledData.map((data) => data.userId);

                settledPids = settledUserIds;

                // Fetch non-settled data for operators and their hierarchy
                // Check if there are any non-settled data for the same users

                const nonSettledGoldenChildren = await prisma.user.findMany({
                    where: {
                        parentId: {
                            in: settledPids,
                        },
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
                });

                settledGids = nonSettledGoldenChildren.map((golden) => golden.id);


                if (settledData.length !== 0) {
                    const settledDataForNonSettled =
                        await prisma.settlementHistory.findMany({
                            where: {
                                userId: {
                                    in: [...nonSettledGoldenChildren.map((ch) => ch.id)],
                                },
                                isPartiallySettled: true,
                                isPartiallySettledByOperator: true,
                                // settledStatus: "N",
                            },
                            select: {
                                userId: true,
                                amount: true
                            },
                        });

                    settledData.push(...settledDataForNonSettled);
                }

                console.log("Settled Data:", settledData);

                settledSummaries = settledData;
            }
            if (roleName === UserRole.PLATINUM) {
                const goldens = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
                });

                userIds = goldens.map((golden) => golden.id);

                gIds = goldens.map((golden) => golden.id);

                // Fetch settled data for goldens
                const settledData = await prisma.settlementHistory.findMany({
                    where: {
                        userId: {in: userIds},
                        isPartiallySettled: false
                    },
                    select: {
                        userId: true,
                        amount: true
                    },
                });

                settledSummaries = settledData;
            }

            let settledIds = new Set([
                ...settledOids,
                ...settledPids,
                ...settledGids,
            ]);

            let filteredUserIds = userIds.filter((id) => !settledIds.has(id));

            let commissionSummaries: any[] = [];

            for (const [category, cycleType] of Object.entries(categoryCycles)) {
                const {cycleStartDate, cycleEndDate} =
                    await this.getPreviousCompletedCycleDates(category);

                const summaries = await prisma.completedCycleSummaries.findMany({
                    where: {
                        userId: {
                            in: userIds,
                        },
                        categoryName: category,
                        settledStatus: "N",
                        ...(roleName === UserRole.SUPER_ADMIN
                            ? {settledBySuperadmin: false}
                            : {}),
                        ...(roleName === UserRole.OPERATOR
                            ? {settledByOperator: false}
                            : {}),
                        ...(roleName === UserRole.PLATINUM
                            ? {settledByPlatinum: false}
                            : {}),
                        cycleEnd: {
                            // gte: cycleStartDate,
                            lte: cycleEndDate,
                        },
                    },
                });

                commissionSummaries.push(...summaries);
            }

            // 3️⃣ Aggregate totals  – keep high-precision until the very end
            const resultByCategory = {
                "E-Games": new Decimal(0),
                "Sports Betting": new Decimal(0),
                "Speciality Games - RNG": new Decimal(0),
                "Speciality Games - Tote": new Decimal(0),
            };

            // Walk every summary once
            for (const s of commissionSummaries) {
                // Add this summary’s payout (or whatever metric you need) to its category bucket
                resultByCategory[s.categoryName] =
                    resultByCategory[s.categoryName].plus(fmt(s.netCommissionAvailablePayout) ?? 0);
            }

            const gross = Object.values(resultByCategory).reduce(
                (a, v) => a.plus(v),
                new Decimal(0)
            )

            const finalPayout = gross

            console.log(`Gross pending commission available payout: `, finalPayout.toNumber())

            // console.log("--------------------------------------------2")

            const totals = {
                totalDeposit: 0,
                totalWithdrawals: 0,
                totalBetAmount: 0,
                netGGR: 0,
                grossCommission: 0,
                netCommissionAvailablePayout: 0,
            };

            let totalPending = finalPayout;
            let totalSettled = new Decimal(0);

            // console.log("Settled Summaries:", settledSummaries);

            for (const summary of settledSummaries) {
                const amt = new Decimal(summary.amount).toDecimalPlaces(2, Decimal.ROUND_DOWN);

                console.log('-------------------------------Net commission available payout:', amt);

                // clamp negatives to zero with Decimal.max
                const add = Decimal.max(new Decimal(0), amt);

                // IMPORTANT: re-assign
                totalSettled = totalSettled.plus(add);

                console.log('[getTotalCommissionByUser] Total Settled:', totalSettled);
            }

            // console.log(`--------------------------------------------------Pending commission available payout: `, totalPending)


            return {
                summaries: commissionSummaries,
                allTotal: totals,
                // totalPending: totalPending - pendingPaymentGatewayFeeSum,
                // totalSettled: totalSettled - settledPaymentGatewayFeeSum,
                totalPending: totalPending.lt(0) ? 0 : totalPending.toNumber(),
                totalSettled: totalSettled.toNumber(),
            };
        } catch (error) {
            throw new Error(`Error creating commission: ${error}`);
        }
    }

    public async getTotalBreakdown(userId: string, roleName: string) {
        try {
            // Normalize role
            roleName = roleName.toLowerCase();

            // ID arrays
            let oIds: string[] = [];
            let pIds: string[] = [];
            let gIds: string[] = [];
            let userIds: string[] = [userId];

            // Commission containers
            const ownCommissionData: Record<string, Decimal> = {
                "E-Games": new Decimal(0),
                "Sports Betting": new Decimal(0),
                "Speciality Games - Tote": new Decimal(0),
                "Speciality Games - RNG": new Decimal(0),
            };

            // 1️⃣ Role-based hierarchy (no settled logic)
            if (roleName === UserRole.SUPER_ADMIN) {
                const operators = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {name: UserRole.OPERATOR}
                    }, select: {id: true}
                });
                oIds = operators.map(o => o.id);
                const platinums = await prisma.user.findMany({
                    where: {
                        parentId: {in: oIds},
                        role: {name: UserRole.PLATINUM}
                    }, select: {id: true}
                });
                pIds = platinums.map(p => p.id);
                const goldens = await prisma.user.findMany({
                    where: {
                        parentId: {in: pIds},
                        role: {name: UserRole.GOLDEN}
                    }, select: {id: true}
                });
                gIds = goldens.map(g => g.id);
                userIds = [...oIds, ...pIds, ...gIds];
            } else if (roleName === UserRole.OPERATOR) {
                const platinums = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {name: UserRole.PLATINUM}
                    }, select: {id: true}
                });
                pIds = platinums.map(p => p.id);
                const goldens = await prisma.user.findMany({
                    where: {
                        parentId: {in: pIds},
                        role: {name: UserRole.GOLDEN}
                    }, select: {id: true}
                });
                gIds = goldens.map(g => g.id);
                userIds = [...pIds, ...gIds];
            } else if (roleName === UserRole.PLATINUM) {
                const goldens = await prisma.user.findMany({
                    where: {parentId: userId, role: {name: UserRole.GOLDEN}},
                    select: {id: true}
                });
                gIds = goldens.map(g => g.id);
                userIds = [...gIds];
            }


            const categories = ["E-Games", "Sports Betting", "Speciality Games - Tote", "Speciality Games - RNG"];

            const pendingSummaries = []

            for (const category of categories) {
                const {cycleStartDate, cycleEndDate} = await this.getPreviousCompletedCycleDates(category);
                const pendingData = await prisma.completedCycleSummaries.findMany({
                    where: {
                        userId: {in: roleName === UserRole.GOLDEN ? [userId] : userIds},
                        categoryName: category,
                        cycleEnd: {lte: cycleEndDate},
                        settledStatus: 'N',
                        ...(roleName === UserRole.SUPER_ADMIN && {settledBySuperadmin: false}),
                        ...(roleName === UserRole.OPERATOR && {settledByOperator: false}),
                        ...(roleName === UserRole.PLATINUM && {settledByPlatinum: false}),
                    }
                });

                pendingSummaries.push(...pendingData);

                // Own commission
                if (roleName === UserRole.OPERATOR || roleName === UserRole.PLATINUM) {
                    const relevantIds = roleName === UserRole.OPERATOR ? pIds : gIds;
                    ownCommissionData[category] = pendingData
                        .filter(d => relevantIds.includes(d.userId))
                        .reduce(
                            (sum: Decimal, d) => sum.plus(d.parentCommission ?? 0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
                            new Decimal(0)
                        );
                }
            }

            // 3️⃣ Aggregate totals  – keep high-precision until the very end
            const resultByCategory = {
                "E-Games": new Decimal(0),
                "Sports Betting": new Decimal(0),
                "Speciality Games - RNG": new Decimal(0),
                "Speciality Games - Tote": new Decimal(0),
            };


            // Walk every summary once
            for (const s of pendingSummaries) {
                // Add this summary’s payout (or whatever metric you need) to its category bucket
                resultByCategory[s.categoryName] =
                    resultByCategory[s.categoryName].plus(s.netCommissionAvailablePayout ?? 0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
            }

            console.log(`Result by category before aggregation: `, resultByCategory);
            console.log(`Own commission data: `, ownCommissionData);

            const own = Object.values(ownCommissionData).reduce((a: Decimal, v: Decimal) => {
                return a.plus(Decimal.max(new Decimal(0), v));
            }, new Decimal(0)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

            const gross = Object.values(resultByCategory).reduce(
                (a, v) => a.plus(v),
                new Decimal(0)
            ).plus(own).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

            const finalPayout = gross // ownCommissionData now internal

            const {cycleStartDate, cycleEndDate} = await this.getPreviousCompletedCycleDates();

            // Response
            return {
                columns: ["", "Amount based on latest completed commission periods pending settlement"],
                periodInfo: {pendingPeriod: {start: cycleStartDate.toISOString(), end: cycleEndDate.toISOString()}},
                rows: [
                    {
                        label: 'Total EGames',
                        pendingSettlement: fmt(resultByCategory['E-Games'].plus(ownCommissionData['E-Games']))
                    },
                    {
                        label: 'Total Sports Betting',
                        pendingSettlement: fmt(resultByCategory['Sports Betting'].plus(ownCommissionData['Sports Betting']))
                    },
                    {
                        label: 'Total Speciality Games - RNG',
                        pendingSettlement: fmt(resultByCategory['Speciality Games - RNG'].plus(ownCommissionData['Speciality Games - RNG']))
                    },
                    {
                        label: 'Total Speciality Games - Tote',
                        pendingSettlement: fmt(resultByCategory['Speciality Games - Tote'].plus(ownCommissionData['Speciality Games - Tote']))
                    },
                    {label: 'Gross Commissions', pendingSettlement: gross},

                    ...(roleName !== UserRole.GOLDEN
                        ? [
                            {label: 'Less: Own Commission', pendingSettlement: own, note: '(Deducted internally)'},
                            {label: 'Commission Available for Payout', pendingSettlement: finalPayout - own},
                            {label: 'Transferable Amount', pendingSettlement: finalPayout - own}
                        ]
                        : [
                            {
                                label: 'Net Commissions',
                                pendingSettlement: finalPayout,
                                note: '(No own commission deduction for Golden)'
                            }
                        ])
                ]
            };
        } catch (error) {
            throw new Error(`Error generating total commission breakdown: ${error}`);
        }
    }


    public async getPaymentGatewayFeesBreakdown(
        userId: string,
        roleName: string
    ) {
        // console.log({ roleName });

        const {cycleStartDate, cycleEndDate} =
            await this.getPreviousCompletedCycleDates();

        console.log(`Getting payment gateway fees for date range: ${cycleStartDate} to ${cycleEndDate}`);

        let depositPgFeesTotal = 0;
        let withdrawPgFeesTotal = 0;
        let totalPgFees = 0;

        if (roleName === UserRole.SUPER_ADMIN) {
            const pgSummaries = await prisma.transaction.findMany({
                where: {
                    transactionType: {
                        in: ["deposit", "withdraw"],
                    },
                    betTime: {
                        gte: new Date(cycleStartDate),
                        lte: new Date(cycleEndDate),
                    },
                },
                select: {
                    transactionType: true,
                    pgFeeCommission: true,
                },
            });

            const depositPgFees = pgSummaries.filter(
                (p) => p.transactionType === "deposit"
            );
            const withdrawPgFees = pgSummaries.filter(
                (p) => p.transactionType === "withdraw"
            );

            depositPgFeesTotal = depositPgFees.reduce(
                (acc, curr) => acc + Number(curr.pgFeeCommission || 0),
                0
            );
            withdrawPgFeesTotal = withdrawPgFees.reduce(
                (acc, curr) => acc + Number(curr.pgFeeCommission || 0),
                0
            );

            totalPgFees = depositPgFeesTotal + withdrawPgFeesTotal;
        } else {
            const pgSummaries = await prisma.transaction.findMany({
                where: {
                    ...(roleName === UserRole.OPERATOR
                        ? {ownerId: {in: [userId]}}
                        : {}),
                    ...(roleName === UserRole.PLATINUM ? {maId: {in: [userId]}} : {}),
                    ...(roleName === UserRole.GOLDEN ? {gaId: {in: [userId]}} : {}),
                    transactionType: {
                        in: ["deposit", "withdraw"],
                    },
                },
                select: {
                    transactionType: true,
                    pgFeeCommission: true,
                },
            });

            const depositPgFees = pgSummaries.filter(
                (p) => p.transactionType === "deposit"
            );
            const withdrawPgFees = pgSummaries.filter(
                (p) => p.transactionType === "withdraw"
            );

            depositPgFeesTotal = depositPgFees.reduce(
                (acc, curr) => acc + Number(curr.pgFeeCommission || 0),
                0
            );
            withdrawPgFeesTotal = withdrawPgFees.reduce(
                (acc, curr) => acc + Number(curr.pgFeeCommission || 0),
                0
            );

            totalPgFees = depositPgFeesTotal + withdrawPgFeesTotal;
        }

        return {
            columns: ["", "Amount"],
            fees: [
                {type: "Deposit", amount: depositPgFeesTotal},
                {type: "Withdrawal", amount: withdrawPgFeesTotal},
                {type: "Total Payment Gateway Fees", amount: totalPgFees},
            ],
        };
    }

    public async getPendingSettlements(userId: string, roleName: string) {
        try {
            // console.log("---------------------------------------------")
            // Calculate the date range for the last completed cycle
            const {cycleStartDate, cycleEndDate} =
                await this.getPreviousCompletedCycleDates();

            // Get only direct child user IDs based on role hierarchy (one level down)
            // const childrenIds = await this.getDirectChildrenIds(userId, roleName);

            let ownCommission = 0;

            const ownCommissionData = {
                "E-Games": {
                    amount: 0,
                    settledBySuperAdmin: false,
                    settledByOperator: false,
                    settledByPlatinum: false,
                },
                "Sports Betting": {
                    amount: 0,
                    settledBySuperAdmin: false,
                    settledByOperator: false,
                    settledByPlatinum: false,
                },
                "Speciality Games - RNG": {
                    amount: 0,
                    settledBySuperAdmin: false,
                    settledByOperator: false,
                    settledByPlatinum: false,
                },
                "Speciality Games - Tote": {
                    amount: 0,
                    settledBySuperAdmin: false,
                    settledByOperator: false,
                    settledByPlatinum: false,
                },
            };

            for (const category of Object.keys(ownCommissionData)) {
                const {cycleStartDate, cycleEndDate} = await this.getPreviousCompletedCycleDates(category);

                const commissionSummaries = await prisma.completedCycleSummaries.findMany({
                    where: {
                        userId: userId,
                        categoryName: category,
                        cycleEnd: {
                            lte: cycleEndDate,
                        },
                    },
                });

                let totalCommission = 0;
                let settledBySuperAdmin = false;
                let settledByOperator = false;
                let settledByPlatinum = false;

                for (const summary of commissionSummaries) {
                    totalCommission += summary.netCommissionAvailablePayout.toNumber() || 0;
                    settledBySuperAdmin ||= summary.settledBySuperadmin || false;
                    settledByOperator ||= summary.settledByOperator || false;
                    settledByPlatinum ||= summary.settledByPlatinum || false;
                }

                ownCommissionData[category] = {
                    amount: totalCommission,
                    settledBySuperAdmin,
                    settledByOperator,
                    settledByPlatinum,
                };
            }

            // ownCommission = Object.values(ownCommissionData).reduce((acc, curr) => acc + curr, 0);
            // console.log({ ownCommissionData, ownCommission });


            let childrenIds = await prisma.user
                .findMany({
                    where: {
                        parentId: userId,
                    },
                    select: {id: true, username: true},
                })
                .then((users) => users.map((user) => user.id));

            const rows = await Promise.all(childrenIds.map(async (id) => {
                let oIds = []
                let pIds = []
                let gIds = []

                let restUserIds = [];

                const username = (await prisma.user.findMany({
                    where: {
                        id: id
                    },
                    select: {
                        username: true
                    }
                })).map(doc => doc.username)[0]

                if (roleName === UserRole.SUPER_ADMIN) {
                    oIds = [id];

                    const platinums = await prisma.user.findMany({
                        where: {
                            parentId: {in: oIds},
                            role: {name: UserRole.PLATINUM},
                        },
                        select: {id: true},
                    });

                    restUserIds = platinums.map((platinum) => platinum.id);

                    pIds = platinums.map((platinum) => platinum.id);

                    const goldens = await prisma.user.findMany({
                        where: {
                            parentId: {in: platinums.map((platinum) => platinum.id)},
                            role: {name: UserRole.GOLDEN},
                        },
                        select: {id: true},
                    });

                    gIds = goldens.map((golden) => golden.id)

                    restUserIds = [...restUserIds, ...goldens.map((golden) => golden.id)];

                    // console.log({restUserIds})
                }
                if (roleName === UserRole.OPERATOR) {
                    pIds = [id];

                    const goldens = await prisma.user.findMany({
                        where: {
                            parentId: {in: pIds},
                        },
                        select: {id: true},
                    });

                    gIds = goldens.map((golden) => golden.id);
                }

                if (roleName === UserRole.PLATINUM) {
                    gIds = [id]
                }

                const categories = [
                    "E-Games",
                    "Sports Betting",
                    "Speciality Games - RNG",
                    "Speciality Games - Tote",
                ];

                // const ownCommissionData = {
                //     "E-Games": 0,
                //     "Sports Betting": 0,
                //     "Speciality Games - Tote": 0,
                //     "Speciality Games - RNG": 0,
                // };

                const directChildrenSummaryIds = []

                const restCommissionIds = []

                const ownCommission = {
                    "E-Games": new Decimal(0),
                    "Sports Betting": new Decimal(0),
                    "Speciality Games - RNG": new Decimal(0),
                    "Speciality Games - Tote": new Decimal(0),
                };

                let pendingSummaries = []

                for (const category of categories) {
                    const {cycleStartDate, cycleEndDate} =
                        await this.getPreviousCompletedCycleDates(category);

                    const summaries = await prisma.completedCycleSummaries.findMany({
                        where: {
                            userId: {in: [...oIds, ...pIds, ...gIds]},
                            cycleEnd: {
                                // gte: cycleStartDate,
                                lte: cycleEndDate,
                            },
                            ...(roleName === UserRole.SUPER_ADMIN && {settledBySuperadmin: false}),
                            ...(roleName === UserRole.OPERATOR && {settledByOperator: false}),
                            ...(roleName === UserRole.PLATINUM && {settledByPlatinum: false}),
                            settledStatus: "N",
                            categoryName: category,
                        },
                        select: {
                            id: true,
                            userId: true,
                            totalBetAmount: true,
                            createdAt: true,
                            netGGR: true,
                            netCommissionAvailablePayout: true,
                            categoryName: true,
                            parentCommission: true
                        },
                    });

                    const isSettledBySuperAdmin = ownCommissionData[category].settledBySuperAdmin;
                    const isSettledByOperator = ownCommissionData[category].settledByOperator;
                    const isSettledByPlatinum = ownCommissionData[category].settledByPlatinum;

                    const shouldConcat =
                        roleName === UserRole.SUPER_ADMIN ||
                        (roleName === UserRole.OPERATOR && isSettledBySuperAdmin) ||
                        (roleName === UserRole.PLATINUM && isSettledByOperator);

                    console.log()

                    if (shouldConcat) {
                        pendingSummaries.push(...summaries)

                        directChildrenSummaryIds.push(...summaries.filter(s => s.userId == id).map(d => d.id))

                        restCommissionIds.push(...summaries.filter(s => s.userId !== id).map(d => d.id))

                        const selfSummaries = summaries.filter(s => s.userId == id)

                        if (!selfSummaries.length) continue;


                        const commissionUserIds = summaries.map(s => s.userId)

                        selfSummaries.reduce((acc, curr) => ownCommission[category] += (fmt(curr.parentCommission) || 0), 0)

                    } else {
                        pendingSummaries.push(...[])
                    }


                    // commissionSummaries = shouldConcat ? commissionSummaries.concat(summaries) : commissionSummaries.concat([]);
                    // restCommissionSummaries = shouldConcat ? restCommissionSummaries.concat(restSummaries) : restCommissionSummaries.concat([]);

                }

                const grossCommissionSum = fmt(pendingSummaries.reduce((sum, summary) => {
                    const value = fmt(summary.netCommissionAvailablePayout || 0);
                    return sum.plus(value);
                }, new Decimal(0)))

                if (!directChildrenSummaryIds.length && grossCommissionSum == 0) {
                    return []
                }

                const totalOwnCommission = fmt(Object.values(ownCommission).reduce(
                    (acc, curr) => acc.plus(Decimal.max(new Decimal(0), fmt(curr))),
                    new Decimal(0)
                ))

                const grossCommission = fmt(new Decimal(grossCommissionSum).plus(totalOwnCommission))

                const netCommissions = fmt(grossCommission - totalOwnCommission)

                return {
                    ids: directChildrenSummaryIds,
                    network: username,
                    restCommissionIds: restCommissionIds,
                    grossCommissions: grossCommission,
                    ownCommission: totalOwnCommission,
                    netCommissions: netCommissions,
                    transferableAmount: netCommissions < 0 ? 0 : netCommissions,
                    breakdownAction: "view",
                    releaseAction: "release_comms",
                };
            }))

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
            const {cycleStartDate, cycleEndDate} =
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
            const {cycleStartDate, cycleEndDate} =
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
            const {cycleStartDate, cycleEndDate} =
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
                    where: {id: targetUserId},
                    include: {role: true},
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

    // public async getTopPerformer(date: string) {
    //   try {
    //     // Using the instance variable instead of creating a new instance
    //     const newCommission =
    //       await this.commissionSummaryDao.generateTopPerform@ers(date);
    //     return newCommission;
    //   } catch (error) {
    //     throw new Error(`Error creating commission: ${error}`);
    //   }
    // }

    public async getLicenseBreakdown(userId: string, roleName: string) {
        try {
            const eGamesCycle = await this.getPreviousCompletedCycleDates("E-Games");
            const sportsCycle =
                await this.getPreviousCompletedCycleDates("Sports Betting");

            roleName = roleName.toLowerCase();
            const result = {
                code: "2010",
                message: "License Commission Breakdown fetched successfully",
                data: {
                    userId: userId,
                    role: roleName,
                    data: [] as any[],
                },
            };

            const buildLicenseData = (
                license: string,
                ggrLabel: string,
                ggrPending: number,
                ggrSettled: number,
                commissionRate: number,
                commissionPending: number,
                commissionSettled: number,
                ownCommission: number
            ) => {
                return {
                    license,
                    fields: [
                        {
                            label: ggrLabel,
                            pendingSettlement: ggrPending,
                            settledAllTime: ggrSettled,
                        },
                        {
                            label: "Commission Rate",
                            value: `${(commissionRate).toFixed(1)}%`,
                        },
                        {
                            label: "Total Commission",
                            pendingSettlement: roleName === UserRole.OPERATOR ? commissionPending + ownCommission : commissionPending,
                            settledAllTime: commissionSettled,
                        },
                    ],
                };
            };

            const buildDefaultLicenseData = (
                license: string,
                label: string,
                rate: string
            ) => ({
                license,
                fields: [
                    {
                        label,
                        pendingSettlement: 0,
                        settledAllTime: 0,
                    },
                    {
                        label: "Commission Rate",
                        value: rate,
                    },
                    {
                        label: "Total Commission",
                        pendingSettlement: 0,
                        settledAllTime: 0,
                    },
                ],
            });

            const pending = {
                eGamesGGR: 0,
                eGamesCommission: 0,
                rngGGR: 0,
                rngCommission: 0,
                sportsBet: 0,
                sportsCommission: 0,
                toteBet: 0,
                toteCommission: 0,
                ownerCommission: 0,
            };

            const settled = {
                eGamesGGR: 0,
                eGamesCommission: 0,
                rngGGR: 0,
                rngCommission: 0,
                sportsBet: 0,
                sportsCommission: 0,
                toteBet: 0,
                toteCommission: 0,
            };

            let pIds = []
            let gIds = []

            let userIds = []

            // 🔽 Superadmin logic starts here
            if (roleName === UserRole.SUPER_ADMIN) {
                const operators = await prisma.user.findMany({
                    where: {
                        role: {
                            name: UserRole.OPERATOR,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

                const operatorIds = operators.map((op) => op.id);

                const platinums = await prisma.user.findMany({
                    where: {
                        parentId: {
                            in: operatorIds
                        }
                    }
                })

                const platinumIds = platinums.map((plat) => plat.id)

                const goldens = await prisma.user.findMany({
                    where: {
                        parentId: {
                            in: platinumIds
                        }
                    }
                })

                const goldenIds = goldens.map((gol) => gol.id)

                const userIds = [...operatorIds, ...platinumIds, ...goldenIds]

                const operatorSummaries = await prisma.completedCycleSummaries.findMany({
                    where: {
                        OR: [
                            {
                                AND: [
                                    {userId: {in: userIds}},
                                    {categoryName: "E-Games"},
                                    {settledStatus: "N"},
                                    {settledBySuperadmin: false},
                                    {
                                        cycleEnd: {
                                            // gte: eGamesCycle.cycleStartDate,
                                            lte: eGamesCycle.cycleEndDate,
                                        },
                                    },
                                ],
                            },
                            {
                                AND: [
                                    {userId: {in: userIds}},
                                    {categoryName: "Speciality Games - RNG"},
                                    {settledStatus: "N"},
                                    {settledBySuperadmin: false},
                                    {
                                        cycleEnd: {
                                            // gte: eGamesCycle.cycleStartDate,
                                            lte: eGamesCycle.cycleEndDate,
                                        },
                                    },
                                ],
                            },
                            {
                                AND: [
                                    {userId: {in: userIds}},
                                    {categoryName: "Sports Betting"},
                                    {settledStatus: "N"},
                                    {settledBySuperadmin: false},
                                    {
                                        cycleEnd: {
                                            // gte: sportsCycle.cycleStartDate,
                                            lte: sportsCycle.cycleEndDate,
                                        },
                                    },
                                ],
                            },
                            {
                                AND: [
                                    {userId: {in: userIds}},
                                    {categoryName: "Speciality Games - Tote"},
                                    {settledStatus: "N"},
                                    {settledBySuperadmin: false},
                                    {
                                        cycleEnd: {
                                            // gte: sportsCycle.cycleStartDate,
                                            lte: sportsCycle.cycleEndDate,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    select: {
                        userId: true,
                        categoryName: true,
                        netCommissionAvailablePayout: true,
                        netGGR: true,
                        totalBetAmount: true,
                        pendingSettleCommission: true,
                        settledStatus: true,
                    },
                });

                let egamesGGR = 0;
                let sportsGGR = 0;
                let rngGGR = 0;
                let toteGGR = 0;
                let egamesCommission = 0;
                let sportsCommission = 0;
                let rngCommission = 0;
                let toteCommission = 0;


                for (const summary of operatorSummaries) {
                    if (summary.categoryName === "E-Games") {
                        const ggr = summary.netGGR;
                        // const comm = summary.pendingSettleCommission;

                        // console.log("pending commission", comm, "ggr", ggr)

                        if (operatorIds.includes(summary.userId)) {
                            egamesGGR += fmt(ggr);
                            ;
                        }

                        console.log("total commission", ggr)
                        egamesCommission += fmt(summary.netCommissionAvailablePayout);

                    } else if (summary.categoryName === "Sports Betting") {
                        const bet = summary.totalBetAmount;
                        const comm = summary.pendingSettleCommission;

                        if (operatorIds.includes(summary.userId)) {
                            sportsGGR += fmt(bet);
                        }

                        sportsCommission += fmt(summary.netCommissionAvailablePayout);

                    } else if (summary.categoryName === "Speciality Games - RNG") {
                        const ggr = summary.netGGR;
                        if (operatorIds.includes(summary.userId)) {
                            rngGGR += fmt(ggr);
                        }
                        rngCommission += fmt(summary.netCommissionAvailablePayout);
                    } else if (summary.categoryName === "Speciality Games - Tote") {
                        const bet = summary.totalBetAmount;
                        if (operatorIds.includes(summary.userId)) {
                            toteGGR += fmt(bet);
                            ;
                        }
                        toteCommission += fmt(summary.netCommissionAvailablePayout);
                    }
                }

                // Assign values to your pending and settled trackers
                pending.eGamesGGR = egamesGGR;
                pending.eGamesCommission = egamesCommission;
                pending.sportsBet = sportsGGR;
                pending.sportsCommission = sportsCommission;
                pending.rngGGR = rngGGR;
                pending.rngCommission = rngCommission;
                pending.toteBet = toteGGR;
                pending.toteCommission = toteCommission;


                // console.log("pending commission", pending.eGamesCommission, "comm", pending.sportsCommission, "grossCommission", pending.eGamesGGR)
            }
            if (roleName === UserRole.OPERATOR) {

                pIds = (await prisma.user.findMany({
                    where: {
                        parentId: userId
                    }
                })).map((doc) => doc.id)

                gIds = (await prisma.user.findMany({
                    where: {
                        parentId: {
                            in: pIds
                        }
                    }
                })).map(doc => doc.id)

                userIds = [...pIds, ...gIds];
            }
            if (roleName === UserRole.PLATINUM) {

                gIds = (await prisma.user.findMany({
                    where: {
                        parentId: userId
                    }
                })).map(doc => doc.id)

                userIds = [...gIds];
            }

            if (roleName === UserRole.GOLDEN) {
                userIds = [userId]
            }


            const eGamesQuery = [
                {userId: {in: userIds}},
                {categoryName: "E-Games"},
                {
                    settledStatus: "N",
                    ...(roleName === UserRole.OPERATOR
                        ? {settledByOperator: false}
                        : {}),
                    ...(roleName === UserRole.PLATINUM
                        ? {settledByPlatinum: false}
                        : {}),
                },
                {
                    cycleEnd: {
                        lte: sportsCycle.cycleEndDate,
                    },
                },
            ]

            const specialityGamesRNGQuery = [
                {userId: {in: userIds}},
                {categoryName: "Speciality Games - RNG"},
                {
                    settledStatus: "N",
                    ...(roleName === UserRole.OPERATOR
                        ? {settledByOperator: false}
                        : {}),
                    ...(roleName === UserRole.PLATINUM
                        ? {settledByPlatinum: false}
                        : {}),
                },
                {
                    cycleEnd: {
                        lte: sportsCycle.cycleEndDate,
                    },
                },
            ]

            const sportsBettingQuery = [
                {userId: {in: userIds}},
                {categoryName: "Sports Betting"},
                {
                    settledStatus: "N",
                    ...(roleName === UserRole.OPERATOR
                        ? {settledByOperator: false}
                        : {}),
                    ...(roleName === UserRole.PLATINUM
                        ? {settledByPlatinum: false}
                        : {}),
                },
                {
                    cycleEnd: {
                        lte: sportsCycle.cycleEndDate,
                    },
                },
            ]
            const specialityGamesToteQuery = [
                {userId: {in: userIds}},
                {categoryName: "Speciality Games - Tote"},
                {
                    settledStatus: "N",
                    ...(roleName === UserRole.OPERATOR
                        ? {settledByOperator: false}
                        : {}),
                    ...(roleName === UserRole.PLATINUM
                        ? {settledByPlatinum: false}
                        : {}),
                },
                {
                    cycleEnd: {
                        lte: sportsCycle.cycleEndDate,
                    },
                },
            ]

            console.log(`E games query: `, eGamesQuery)
            console.log(`Sports betting query: `, sportsBettingQuery)

            const summaries = await prisma.completedCycleSummaries.findMany({
                where: {
                    OR: [
                        {
                            AND: eGamesQuery,
                        },
                        {
                            AND: sportsBettingQuery,
                        },
                        {
                            AND: specialityGamesRNGQuery,
                        },
                        {
                            AND: specialityGamesToteQuery,
                        }
                    ],
                },
                select: {
                    categoryName: true,
                    settledStatus: true,
                    netGGR: true,
                    totalBetAmount: true,
                    userId: true,
                    netCommissionAvailablePayout: true,
                    pendingSettleCommission: true,
                    settledBySuperadmin: true,
                    settledByOperator: true,
                    settledByPlatinum: true,
                    parentCommission: true
                },
            });

            // console.log({summaries})

            // console.log(`License Breakdown table summaries: `, summaries)
            let ownEGamesCommission = 0
            let ownRNGCommission = 0
            let ownToteCommission = 0
            let ownSportsBettingCommission = 0

            for (const summary of summaries) {
                const category = summary.categoryName;
                const ggr = summary.netGGR;
                const bet = summary.totalBetAmount;
                const comm = fmt(summary.netCommissionAvailablePayout);
                const parentCommission = fmt(summary.parentCommission)


                if (category === "E-Games") {

                    if (roleName === UserRole.OPERATOR) {


                        if (pIds.includes(summary.userId)) {
                            pending.eGamesGGR += fmt(ggr);
                            // console.log(`ParentCommission: `, parentCommission)
                            ownEGamesCommission += fmt(parentCommission)
                        }

                        pending.eGamesCommission += fmt(comm);
                    }
                    if (roleName === UserRole.GOLDEN) {
                        pending.eGamesGGR += fmt(ggr);
                        pending.eGamesCommission += fmt(comm);
                    } else if (roleName === UserRole.PLATINUM) {
                        // if (gIds.includes(summary.userId)) {
                        // }
                        pending.eGamesGGR += fmt(ggr);
                        pending.eGamesCommission += comm + parentCommission;
                    }
                } else if (category === "Sports Betting") {
                    if (roleName === UserRole.OPERATOR) {

                        if (pIds.includes(summary.userId)) {
                            pending.sportsBet += fmt(bet);
                            ownSportsBettingCommission += fmt(parentCommission);
                        }
                        pending.sportsCommission += fmt(comm);
                    }
                    if (roleName === UserRole.GOLDEN) {
                        pending.sportsBet += fmt(bet);
                        pending.sportsCommission += fmt(comm);
                    } else if (roleName === UserRole.PLATINUM) {
                        if (gIds.includes(summary.userId)) {
                        }
                        pending.sportsBet += fmt(bet);
                        pending.sportsCommission += comm + parentCommission;
                    }
                } else if (category === "Speciality Games - RNG") {
                    // NEW handling for RNG
                    if (roleName === UserRole.OPERATOR) {
                        if (pIds.includes(summary.userId)) {
                            pending.rngGGR += fmt(ggr);
                            ownRNGCommission += fmt(parentCommission);
                        }
                        pending.rngCommission += fmt(comm);
                    }
                    if (roleName === UserRole.GOLDEN) {
                        pending.rngGGR += fmt(ggr);
                        pending.rngCommission += fmt(comm);
                    } else if (roleName === UserRole.PLATINUM) {
                        pending.rngGGR += fmt(ggr);
                        pending.rngCommission += comm + parentCommission;
                    }
                } else if (category === "Speciality Games - Tote") {
                    // NEW handling for Tote
                    if (roleName === UserRole.OPERATOR) {
                        if (pIds.includes(summary.userId)) {
                            pending.toteBet += fmt(bet);
                            ownToteCommission += fmt(parentCommission);
                        }
                        pending.toteCommission += fmt(comm);
                    }
                    if (roleName === UserRole.GOLDEN) {
                        pending.toteBet += fmt(bet);
                        pending.toteCommission += fmt(comm);
                    } else if (roleName === UserRole.PLATINUM) {
                        pending.toteBet += fmt(bet);
                        pending.toteCommission += comm + parentCommission;
                    }
                }

            }


            console.log({ownEGamesCommission, ownSportsBettingCommission})


            // Determine commission rates
            let eGamesRate = 0;
            let sportsRate = 0;
            let rngRate = 0;
            let toteRate = 0;

            switch (roleName) {
                case UserRole.SUPER_ADMIN:
                    eGamesRate = 30;
                    sportsRate = 2;
                    rngRate = 30;
                    toteRate = 2;
                    break;

                case UserRole.OPERATOR:
                case UserRole.PLATINUM:
                case UserRole.GOLDEN: {
                    const commissions = await prisma.commission.findMany({
                        where: {
                            userId: userId,
                        },
                        select: {
                            totalAssignedCommissionPercentage: true,
                            commissionPercentage: true,
                            category: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    });

                    for (const row of commissions) {
                        const percentage =
                            roleName === UserRole.GOLDEN
                                ? row.commissionPercentage
                                : row.totalAssignedCommissionPercentage;

                        switch (row.category.name) {
                            case "E-Games":
                                eGamesRate = percentage;
                                break;
                            case "Sports Betting":
                                sportsRate = percentage;
                                break;
                            case "Speciality Games - RNG":
                                rngRate = percentage;
                                break;
                            case "Speciality Games - Tote":
                                toteRate = percentage;
                                break;
                        }
                    }

                    break;
                }

                default:
                    throw new Error("Invalid role");
            }

            console.log(`Pending Data: `, pending)


            result.data.data.push(
                buildLicenseData(
                    "E-Games",
                    "GGR",
                    pending.eGamesGGR,
                    settled.eGamesGGR,
                    eGamesRate,
                    pending.eGamesCommission,
                    settled.eGamesCommission,
                    ownEGamesCommission
                ),
                buildLicenseData(
                    "Sports Betting",
                    "Total Bet Amount",
                    pending.sportsBet,
                    settled.sportsBet,
                    sportsRate,
                    pending.sportsCommission,
                    settled.sportsCommission,
                    ownSportsBettingCommission
                ),
                buildLicenseData(
                    "Speciality Games - Tote",
                    "Total Bet Amount",
                    pending.toteBet,
                    settled.toteBet,
                    toteRate,
                    pending.toteCommission,
                    settled.toteCommission,
                    ownToteCommission // or ownToteCommission if separate
                ),
                buildLicenseData(
                    "Speciality Games - RNG",
                    "GGR",
                    pending.rngGGR,
                    settled.rngGGR,
                    rngRate,
                    pending.rngCommission,
                    settled.rngCommission,
                    ownRNGCommission // or ownRNGCommission if you track separately
                )
            );

            return result;
        } catch (error) {
            throw new Error(`Error getting license breakdown: ${error}`);
        }
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

    public async markCommissionSummaryStatus(
        ids: string[],
        childrenCommissionIds: string[],
        roleName: UserRole,
        referenceId: string
    ) {
        try {
            // Using the instance variable instead of creating a new instance
            const commissionData = await this.commissionDao.markCommissionAsSettled(
                ids,
                roleName,
                childrenCommissionIds,
                referenceId
            );
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

        const CATEGORY_GROUPS: Record<string, { groupName: string; type: "BI_MONTHLY" | "WEEKLY"; license: string }> = {
            "E-Games": {
                groupName: "Casino Report",
                type: "BI_MONTHLY",
                license: "EGames/Specialty RNG",
            },
            "Speciality Games - RNG": {
                groupName: "Casino Report",
                type: "BI_MONTHLY",
                license: "EGames/Specialty RNG",
            },
            "Sports Betting": {
                groupName: "Sports Report",
                type: "WEEKLY",
                license: "Sports Betting/Specialty Tote",
            },
            "Speciality Games - Tote": {
                groupName: "Sports Report",
                type: "WEEKLY",
                license: "Sports Betting/Specialty Tote",
            },
        };

        try {
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
                    throw new Error("Unauthorized access.");
            }

            // Fetch downline users
            let downlineUsers = downlineId
                ? await prisma.user.findMany({
                    where: {
                        id: downlineId,
                        parentId: userId,
                        role: {name: downlineRole},
                    },
                    select: {id: true, username: true},
                })
                : await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {name: downlineRole},
                    },
                    select: {id: true, username: true},
                });

            if (downlineUsers.length === 0) {
                return {reports: [], message: "No downline users found."};
            }

            const currentDate = new Date();

            // Auto-calculate start and end dates if not provided
            if (!startDate || !endDate) {
                const downlineIds = downlineUsers.map((u) => u.id);

                const earliest = await prisma.completedCycleSummaries.findFirst({
                    where: {
                        userId: {in: downlineIds},
                        settledStatus: "Y",
                    },
                    orderBy: {settledAt: "asc"},
                    select: {settledAt: true},
                });

                const latest = await prisma.completedCycleSummaries.findFirst({
                    where: {
                        userId: {in: downlineIds},
                        settledStatus: "Y",
                    },
                    orderBy: {settledAt: "desc"},
                    select: {settledAt: true},
                });

                if (!earliest || !latest) {
                    const {cycleStartDate, cycleEndDate} = await this.getCurrentCycleDates();
                    startDate = cycleStartDate;
                    endDate = new Date(Math.min(cycleEndDate.getTime(), currentDate.getTime()));

                    return {
                        reports: [],
                        message: "No settled commission reports found.",
                    };
                }

                startDate = earliest.settledAt;
                endDate = latest.settledAt;
            }

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error("Invalid date format.");
            }

            // Get reports per user
            const reportsArrays = await Promise.all(
                downlineUsers.map(async (downline) => {
                    const summaries = await prisma.completedCycleSummaries.findMany({
                        where: {
                            userId: downline.id,
                            settledStatus: "Y",
                            settledAt: {gte: startDate, lte: endDate},
                        },
                        orderBy: {settledAt: "asc"},
                    });

                    if (summaries.length === 0) return [];

                    const groupedByPeriod = new Map();

                    for (const summary of summaries) {

                        const category = summary.categoryName;
                        const categoryGroup = CATEGORY_GROUPS[category];

                        if (!categoryGroup) continue;

                        const createdAt = summary.createdAt;
                        let fromDate: Date, toDate: Date;

                        const day = createdAt.getDate();
                        const year = createdAt.getFullYear();
                        const month = createdAt.getMonth();

                        if (categoryGroup.type === "BI_MONTHLY") {
                            const day = createdAt.getDate();
                            const year = createdAt.getFullYear();
                            const month = createdAt.getMonth();
                            fromDate = new Date(year, month, day <= 15 ? 1 : 16);
                            toDate = day <= 15
                                ? new Date(year, month, 15)
                                : new Date(year, month + 1, 0);
                        } else {
                            fromDate = startOfWeek(createdAt, {weekStartsOn: 1}); // Monday
                            toDate = endOfWeek(createdAt, {weekStartsOn: 1});     // Sunday
                        }

                        if (toDate > currentDate) toDate = new Date(currentDate);

                        const periodKey = `${categoryGroup.groupName}-${fromDate.toISOString()}-${toDate.toISOString()}`;

                        if (!groupedByPeriod.has(periodKey)) {
                            groupedByPeriod.set(periodKey, {
                                groupName: categoryGroup.groupName,
                                fromDate,
                                toDate,
                                downlineId: downline.id,
                                downlineName: downline.username,
                                summaries: [],
                            });
                        }

                        groupedByPeriod.get(periodKey).summaries.push(summary);
                    }

                    const reportItems = await Promise.all(
                        Array.from(groupedByPeriod.values()).map(async (group, index) => {
                            const latest = group.summaries[group.summaries.length - 1];

                            let referenceId = "-";
                            if (latest?.settledAt) {
                                const match = await prisma.settlementHistory.findFirst({
                                    where: {
                                        userId: group.downlineId,
                                        isPartiallySettled: false,
                                        createdAt: {
                                            gte: new Date(latest.settledAt.setHours(0, 0, 0, 0)),
                                            lte: new Date(latest.settledAt.setHours(23, 59, 59, 999)),
                                        },
                                    },
                                    select: {referenceId: true},
                                });
                                referenceId = match?.referenceId ?? "-";
                            }

                            return {
                                id: index + 1,
                                reportType: group.groupName,
                                fromDate: format(group.fromDate, "M-dd-yyyy"),
                                toDate: format(group.toDate, "M-dd-yyyy"),
                                downlineName: group.downlineName,
                                status: "COMPLETED",
                                dateSettled: latest?.settledAt
                                    ? format(latest.settledAt, "dd-MM-yyyy")
                                    : "-",
                                refId: referenceId,
                                license: CATEGORY_GROUPS[group.summaries[0]?.categoryName]?.license ?? "-",
                                action: "DOWNLOAD",
                                _metadata: {
                                    downlineId: group.downlineId,
                                    fromDateISO: group.fromDate.toISOString(),
                                    toDateISO: group.toDate.toISOString(),
                                },
                            };
                        })
                    );

                    return reportItems;
                })
            );

            const reports = reportsArrays.flat();

            return {
                reports,
                message:
                    reports.length > 0
                        ? "Settled commission reports fetched successfully."
                        : "No settled commission reports found for the specified criteria.",
            };
        } catch (error) {
            throw new Error(`Error fetching settled commission reports: ${error.message}`);
        }
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
                    where: {id: targetUserId},
                    include: {role: true},
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

    private async getCommissionSummariesForUserIds(cycleStartDate: Date, cycleEndDate: Date, category: string, userIds: string[]) {
        return prisma.commissionSummary.findMany({
            where: {
                createdAt: {
                    gte: cycleStartDate,
                    lte: cycleEndDate,
                },
                categoryName: category,
                userId: {
                    in: userIds
                }
            },
        });
    }

    private async getDescendantUserIds(
        parentIds: string[],
        roleHierarchy: UserRole[]
    ): Promise<string[]> {
        let allIds: string[] = [];

        for (let i = 0; i < roleHierarchy.length; i++) {
            const currentRole = roleHierarchy[i];

            if (parentIds.length === 0) break;

            const users = await prisma.user.findMany({
                where: {
                    parentId: {in: parentIds},
                    role: {name: currentRole},
                },
                select: {id: true},
            });

            const currentIds = users.map(user => user.id);
            allIds.push(...currentIds);

            // Use currentIds as parentIds for next level
            parentIds = currentIds;
        }

        return allIds;
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
                label: "Commission Available for Payout",
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
                label: "Commission Available for Payout",
                pendingSettlement:
                    pendingTotal.grossCommission - pendingTotal.paymentGatewayFee,
                allTime: allTimeTotal.grossCommission - allTimeTotal.paymentGatewayFee,
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

    private getRoleLabelForUser(role: string): string {
        switch (role.toLowerCase()) {
            case UserRole.SUPER_ADMIN:
                return "ALL NETWORKS";
            default:
                return "Own Commission";
        }
    }

    private async getPaymentGatewayFee(
        userIds: string[],
        settled: boolean = false,
        startDate: Date,
        endDate: Date,
        roleName?: string
    ): Promise<number> {
        const commissions = await prisma.commissionSummary.findMany({
            where: {
                userId: {in: userIds},
                paymentGatewayFee: {
                    gte: 0,
                },
                ...(roleName === UserRole.SUPER_ADMIN
                    ? {settledBySuperadmin: settled}
                    : roleName === UserRole.OPERATOR
                        ? {settledByOperator: settled}
                        : roleName === UserRole.PLATINUM
                            ? {settledByPlatinum: settled}
                            : {}),
                ...(settled ? {settledStatus: "Y"} : {settledStatus: "N"}),
                // ...(startDate && endDate
                //   ? { createdAt: { gte: startDate, lte: endDate } }
                //   : {}),
            },
            select: {paymentGatewayFee: true},
        });

        return commissions.reduce(
            (total, commission) => total + (commission.paymentGatewayFee || 0),
            0
        );
    }

    private async getSettledCommissionData(userIds: string[]) {
        // 1. Fetch Settled Operator Data
        const settledData = await prisma.commissionSummary.findMany({
            where: {
                userId: {in: userIds},
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

        // 2. Find Downline Platinum Users (children of settled operators)
        const platinumUsers = await prisma.user.findMany({
            where: {
                parentId: {in: settledUserIds},
                role: {name: UserRole.PLATINUM},
            },
            select: {id: true},
        });

        const settledPids = platinumUsers.map((p) => p.id);

        // 3. Find Downline Golden Users (children of those Platinum users)
        const goldenUsers = await prisma.user.findMany({
            where: {
                parentId: {in: settledPids},
                role: {name: UserRole.GOLDEN},
            },
            select: {id: true},
        });

        const settledGids = goldenUsers.map((g) => g.id);

        // 4. Fetch Non-Settled Commission Summary for Platinum & Golden Users
        if (settledData.length !== 0) {
            const nonSettledData = await prisma.commissionSummary.findMany({
                where: {
                    userId: {in: [...settledPids, ...settledGids]},
                    settledStatus: "N",
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

            settledData.push(...nonSettledData);
        }

        // 5. Group by Category
        const categoryData: Record<
            string,
            { settled: typeof settledData; pending: any[] }
        > = {};

        for (const summary of settledData) {
            const cat = summary.categoryName;
            if (!categoryData[cat]) {
                categoryData[cat] = {pending: [], settled: []};
            }
            categoryData[cat].settled.push(summary);
        }

        return {
            settledData,
            categoryData,
            settledUserIds,
            settledOids: settledUserIds,
            settledPids,
            settledGids,
        };
    }

    // Helper method to get date range for previous completed cycle
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
        // if (
        //     categoryName === "Sports Betting" ||
        //     categoryName === "Speciality Games - Tote"
        // ) {
        //     return this.getWeeklyCompletedCycleDates(currentDate);
        // }

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
            cycleEndDate: new Date(mostRecentSunday.setHours(23, 59, 59, 999)),
        };
    }

    private getRunningTallyPeriodStartDate(categoryName?: string) {
        const currentDate = new Date();

        // Weekly categories
        // if (
        //     categoryName === "Sports Betting" ||
        //     categoryName === "Speciality Games - Tote"
        // ) {
        //     const day = currentDate.getDay(); // 0 = Sunday
        //     const offset = day === 0 ? 6 : day - 1; // Make Monday = 0
        //     const startOfWeek = new Date(currentDate);
        //     startOfWeek.setDate(currentDate.getDate() - offset);
        //     startOfWeek.setHours(0, 0, 0, 0);
        //
        //     // console.log(`Showing running tally from start of week: ${startOfWeek.toISOString()} till today: ${currentDate.toISOString()} for category: ${categoryName}`);
        //
        //     return {
        //         cycleStartDate: startOfWeek,
        //         cycleEndDate: currentDate,
        //     };
        // }

        // Bi-Monthly categories: E-Games & RNG
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-indexed
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const midDay = Math.floor(daysInMonth / 2);

        const cycleStartDate = new Date(currentDate);
        if (currentDate.getDate() > midDay) {
            cycleStartDate.setDate(midDay + 1); // Start from mid + 1
        } else {
            cycleStartDate.setDate(1); // Start from beginning of the month
        }
        cycleStartDate.setHours(0, 0, 0, 0);

        // console.log(`Showing running tally from start of month: ${cycleStartDate.toISOString()} till today: ${currentDate.toISOString()} for category: ${categoryName}`);

        return {
            cycleStartDate,
            cycleEndDate: currentDate,
        };
    }

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
                    where: {role: {name: UserRole.OPERATOR}},
                    select: {id: true},
                });
                break;
            case UserRole.OPERATOR:
                directChildren = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {name: UserRole.PLATINUM},
                    },
                    select: {id: true},
                });
                break;
            case UserRole.PLATINUM:
                directChildren = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
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
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
                });
                childIds = [...childIds, ...grandChildren.map((gc) => gc.id)];
            }
        }

        return childIds;
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

        return {cycleStartDate, cycleEndDate};
    }
}

export {CommissionService};
