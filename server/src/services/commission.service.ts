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
    endOfMonth,
    format,
    getDaysInMonth,
    lastDayOfMonth,
    setDate,
    startOfMonth,
    subMonths,
} from "date-fns";
import {ResponseCodes} from "../common/config/responseCodes";
import {Response} from "../common/config/response";
import UserDao from "../daos/user.dao";
import logger from "../common/logger";
import {publicEncrypt} from "crypto";

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
    private userDao: UserDao;

    constructor() {
        this.commissionDao = new CommissionDao();
        this.roleDao = new RoleDao();
        this.commissionSummaryDao = new GenerateCommission(); // Initialize the commission summary DAO
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


                userIds = [...userIds, ...gChildrensIds];

                const settledData = await prisma.commissionSummary.findMany({
                    where: {
                        userId: {in: oChildensIds},
                        settledStatus: "Y",
                    },
                    select: {
                        userId: true,
                        user: {
                            include: {
                                role: true,
                            },
                        },
                        settledBySuperadmin: true,
                        settledByOperator: true,
                        settledByPlatinum: true,
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
                        await prisma.commissionSummary.findMany({
                            where: {
                                userId: {
                                    in: [
                                        ...nonSettledPlatinumChildren.map((ch) => ch.id),
                                        ...nonSettledGoldenChildren.map((ch) => ch.id),
                                    ],
                                },
                                settledBySuperadmin: true,
                            },
                            select: {
                                userId: true,
                                user: {
                                    include: {
                                        role: true,
                                    },
                                },
                                categoryName: true,
                                totalBetAmount: true,
                                settledBySuperadmin: true,
                                settledByOperator: true,
                                settledByPlatinum: true,
                                netGGR: true,
                                grossCommission: true,
                                paymentGatewayFee: true,
                                netCommissionAvailablePayout: true,
                            },
                        });

                    settledData.push(...(settledDataForNonSettled as any));

                    // console.log("Settled Data:", settledData);

                    settledSummaries = settledData;
                }

                // Step 1: Build Operator-wise group map
                const operatorGroupsMap = new Map<string, Set<string>>();

                for (const opr of oChildens) {
                    const oprId = opr.id;

                    const platinums = pChildrens
                        .filter(p => p.parentId === oprId)
                        .map(p => p.id);

                    const platIdsSet = new Set(platinums);

                    const goldens = gChildrens
                        .filter(g => platIdsSet.has(g.parentId))
                        .map(g => g.id);

                    const groupUserIds = new Set([oprId, ...platinums, ...goldens]);
                    operatorGroupsMap.set(oprId, groupUserIds);
                }

                // Step 2: Group settledSummaries by operator
                const groupedSettledSummaries = new Map<string, any[]>();

                for (const summary of settledData) {
                    const summaryUserId = summary.userId;

                    let operatorId = null;
                    for (const [oprId, groupSet] of operatorGroupsMap.entries()) {
                        if (groupSet.has(summaryUserId)) {
                            operatorId = oprId;
                            break;
                        }
                    }

                    if (!operatorId) continue;

                    if (!groupedSettledSummaries.has(operatorId)) {
                        groupedSettledSummaries.set(operatorId, []);
                    }

                    groupedSettledSummaries.get(operatorId)!.push(summary);
                }

                // Step 3: Filter out groups with negative total netCommissionAvailablePayout
                let filteredSettledSummaries: any[] = [];

                for (const [_, groupSummaries] of groupedSettledSummaries.entries()) {
                    const total = groupSummaries.reduce(
                        (acc, s) => acc + (s.netCommissionAvailablePayout || 0),
                        0
                    );

                    if (total >= 0) {
                        filteredSettledSummaries = filteredSettledSummaries.concat(groupSummaries);
                    }
                }

// Finally, update your settledSummaries
                settledSummaries = filteredSettledSummaries;
            } else if (roleName === UserRole.OPERATOR) {
                const platinums = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {name: UserRole.PLATINUM},
                    },
                    select: {id: true},
                });

                userIds = platinums.map((platinum) => platinum.id);

                const goldens = await prisma.user.findMany({
                    where: {
                        parentId: {in: platinums.map((platinum) => platinum.id)},
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
                });

                userIds = userIds.concat(goldens.map((golden) => golden.id));

                // Fetch settled data for platinums and their hierarchy
                const settledData = await prisma.commissionSummary.findMany({
                    where: {
                        userId: {in: platinums.map((platinum) => platinum.id)},
                        settledStatus: "Y",
                    },
                    select: {
                        userId: true,
                        user: {
                            include: {
                                role: true,
                            },
                        },
                        categoryName: true,
                        totalBetAmount: true,
                        settledBySuperadmin: true,
                        settledByOperator: true,
                        settledByPlatinum: true,
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
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
                });

                settledGids = nonSettledGoldenChildren.map((golden) => golden.id);

                console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
                console.log({settledGids});
                console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")


                if (settledData.length !== 0) {
                    const settledDataForNonSettled =
                        await prisma.commissionSummary.findMany({
                            where: {
                                userId: {
                                    in: [...nonSettledGoldenChildren.map((ch) => ch.id)],
                                },
                                settledByOperator: true,
                                // settledStatus: "N",
                            },
                            select: {
                                userId: true,
                                user: {
                                    include: {
                                        role: true,
                                    },
                                },
                                categoryName: true,
                                totalBetAmount: true,
                                settledBySuperadmin: true,
                                settledByOperator: true,
                                settledByPlatinum: true,
                                netGGR: true,
                                grossCommission: true,
                                paymentGatewayFee: true,
                                netCommissionAvailablePayout: true,
                            },
                        });

                    settledData.push(...settledDataForNonSettled);
                }

                // settledData.push(...settledDataForNonSettled);

                // const totalSettledAmount = settledData.reduce(
                //     (acc, curr) => acc + (curr.netCommissionAvailablePayout || 0),
                //     0
                // );
                //
                // console.log(`Total settled data: `, totalSettledAmount)

                settledSummaries = settledData;


            } else if (roleName === UserRole.PLATINUM) {
                const goldens = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
                });

                userIds = goldens.map((golden) => golden.id);

                // Fetch settled data for goldens
                const settledData = await prisma.commissionSummary.findMany({
                    where: {
                        userId: {in: userIds},
                        settledStatus: "Y",
                    },
                    select: {
                        userId: true,
                        categoryName: true,
                        totalBetAmount: true,
                        settledBySuperadmin: true,
                        settledByOperator: true,
                        settledByPlatinum: true,
                        netGGR: true,
                        grossCommission: true,
                        paymentGatewayFee: true,
                        netCommissionAvailablePayout: true,
                    },
                });

                // console.log("Settled Data: For Platinum", settledData);

                settledSummaries = settledData;

                settledGids = settledData.map((data) => data.userId);

                // gIds = [...goldens.map((golden) => golden.id)];

                pendingPaymentGatewayFee = await this.getPaymentGatewayFee(
                    userIds,
                    false,
                    undefined,
                    undefined,
                    roleName
                );

                settledPaymentGatewayFee = await this.getPaymentGatewayFee(
                    userIds,
                    true,
                    undefined,
                    undefined,
                    roleName
                );
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

                const summaries = await prisma.commissionSummary.findMany({
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
                        createdAt: {
                            gte: cycleStartDate,
                            lte: cycleEndDate,
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

                commissionSummaries = commissionSummaries.concat(summaries);

            }

            const totalCommission = commissionSummaries.reduce((acc, curr) => curr.netCommissionAvailablePayout += acc, 0)
            console.log(`Commission summaries from ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`, totalCommission)

            // console.log("--------------------------------------------2")

            const totals = {
                totalDeposit: 0,
                totalWithdrawals: 0,
                totalBetAmount: 0,
                netGGR: 0,
                grossCommission: 0,
                netCommissionAvailablePayout: 0,
            };

            let totalPending = totalCommission;
            let totalSettled = 0;

            // console.log("Settled Summaries:", settledSummaries);

            for (const summary of settledSummaries) {

                console.log(`--------------------------------------------------Net commission available payout: `, summary.netCommissionAvailablePayout)
                // if (summary.netCommissionAvailablePayout >= 0) {
                totalSettled += summary.netCommissionAvailablePayout;
                // }
            }

            // console.log("Total Settled:", totalSettled);

            // for (const summary of commissionSummaries) {
            //     if (summary.settledStatus === "N") {
            // totalPending = commissionSummaries.reduce((acc, curr) => curr.netCommissionAvailablePayout += acc, 0)
            //     }
            // }

            // console.log("--------------------------------------------2");

            // console.log({settledPaymentGatewayFeeFiltered});

            // console.log({ totalPending, totalSettled })

            console.log(`--------------------------------------------------Pending commission available payout: `, totalPending)

            return {
                summaries: commissionSummaries,
                allTotal: totals,
                // totalPending: totalPending - pendingPaymentGatewayFeeSum,
                // totalSettled: totalSettled - settledPaymentGatewayFeeSum,
                totalPending: totalPending,
                totalSettled: totalSettled,
            };
        } catch (error) {
            throw new Error(`Error creating commission: ${error}`);
        }
    }

    public async getTotalBreakdown(userId: string, roleName: string) {
        try {
            let userIds = [userId];
            roleName = roleName.toLowerCase();

            let oIds = [];
            let pIds = [];
            let gIds = [];

            let settledOids = [];
            let settledPids = [];
            let settledGids = [];

            let pendingPaymentGatewayFee = 0;
            let settledPaymentGatewayFee = 0;

            let ownCommission = 0;

            const categoryData = {
                "E-Games": {pending: [], settled: []},
                "Sports Betting": {pending: [], settled: []},
                "Speciality Games - Tote": {pending: [], settled: []},
                "Speciality Games - RNG": {pending: [], settled: []},
            };

            const ownCommissionData = {
                "E-Games": {pending: 0, settled: 0},
                "Sports Betting": {pending: 0, settled: 0},
                "Speciality Games - Tote": {pending: 0, settled: 0},
                "Speciality Games - RNG": {pending: 0, settled: 0},
            };

            // Handle hierarchy based access
            if (roleName === UserRole.SUPER_ADMIN) {
                const operators = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {name: UserRole.OPERATOR},
                    },
                    select: {id: true},
                });
                userIds = operators.map((op) => op.id);
                oIds = userIds;

                const platinums = await prisma.user.findMany({
                    where: {
                        parentId: {in: operators.map((op) => op.id)},
                        role: {name: UserRole.PLATINUM},
                    },
                    select: {id: true},
                });

                userIds = userIds.concat(platinums.map((platinum) => platinum.id));

                const goldens = await prisma.user.findMany({
                    where: {
                        parentId: {in: platinums.map((platinum) => platinum.id)},
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
                });

                gIds = goldens.map((golden) => golden.id);

                userIds = userIds.concat(goldens.map((golden) => golden.id));

                // Fetch settled data for operators and their hierarchy
                const settledData = await prisma.commissionSummary.findMany({
                    where: {
                        userId: {in: oIds},
                        settledStatus: "Y",
                    },
                    select: {
                        userId: true,
                        settledAt: true,
                        categoryName: true,
                        totalBetAmount: true,
                        netGGR: true,
                        grossCommission: true,
                        paymentGatewayFee: true,
                        netCommissionAvailablePayout: true,
                    },
                });

                // console.log({settledData})

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
                        await prisma.commissionSummary.findMany({
                            where: {
                                userId: {
                                    in: [
                                        ...nonSettledPlatinumChildren.map((ch) => ch.id),
                                        ...nonSettledGoldenChildren.map((ch) => ch.id),
                                    ],
                                },
                                settledBySuperadmin: true,
                                // categoryName: {
                                //   not: "Unknown"
                                // }
                                // settledStatus: "N",
                            },
                            select: {
                                userId: true,
                                categoryName: true,
                                totalBetAmount: true,
                                netGGR: true,
                                grossCommission: true,
                                settledAt: true,
                                paymentGatewayFee: true,
                                netCommissionAvailablePayout: true,
                            },
                        });

                    settledData.push(...settledDataForNonSettled);
                }

                // Add settled data to categoryData
                settledData.forEach((summary) => {
                    if (!categoryData[summary.categoryName]) {
                        categoryData[summary.categoryName] = {pending: [], settled: []};
                    }
                    categoryData[summary.categoryName].settled.push(summary);
                });

                const settledUserIdsSet = new Set(settledUserIds);

                const nonSettledOIds = oIds.filter((id) => !settledUserIdsSet.has(id));

                // console.log({settledData})

                pendingPaymentGatewayFee = await this.getPaymentGatewayFee(
                    nonSettledOIds,
                    false,
                    undefined,
                    undefined
                );

                settledPaymentGatewayFee = await this.getPaymentGatewayFee(
                    oIds.filter((id) => settledUserIdsSet.has(id)),
                    true,
                    undefined,
                    undefined
                );
            }

            if (roleName === UserRole.OPERATOR) {
                const platinums = await prisma.user.findMany({
                    where: {
                        parentId: userId,
                        role: {name: UserRole.PLATINUM},
                    },
                    select: {id: true},
                });

                pIds = platinums.map((platinum) => platinum.id);

                userIds = platinums.map((platinum) => platinum.id);

                const goldens = await prisma.user.findMany({
                    where: {
                        parentId: {in: platinums.map((platinum) => platinum.id)},
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
                });

                userIds = userIds.concat(goldens.map((golden) => golden.id));

                // Fetch settled data for platinums and their hierarchy
                const settledData = await prisma.commissionSummary.findMany({
                    where: {
                        userId: {in: [...pIds]},
                        settledStatus: "Y",
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
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
                });

                settledGids = nonSettledGoldenChildren.map((golden) => golden.id);

                console.log("++++++++++++++++++++++++++++--+++++++++++++++++++++++++++++++++++++")
                console.log({settledGids});
                console.log("++++++++++++++++++++++++++++--+++++++++++++++++++++++++++++++++++++")


                if (settledData.length !== 0) {
                    const settledDataForNonSettled =
                        await prisma.commissionSummary.findMany({
                            where: {
                                userId: {
                                    in: settledGids,
                                },
                                settledByOperator: true,
                                // settledBySuperadmin:
                                // settledStatus: "N",
                            },
                            select: {
                                userId: true,
                                user: {
                                    include: {
                                        role: true,
                                    },
                                },
                                categoryName: true,
                                totalBetAmount: true,
                                settledBySuperadmin: true,
                                settledByOperator: true,
                                settledByPlatinum: true,
                                netGGR: true,
                                grossCommission: true,
                                paymentGatewayFee: true,
                                netCommissionAvailablePayout: true,
                            },
                        });

                    settledData.push(...settledDataForNonSettled);
                }

                const totalSettledAmount = settledData.reduce(
                    (acc, curr) => acc + (curr.netCommissionAvailablePayout || 0),
                    0
                );

                console.log(`Settled Data:---`, settledData)

                // console.log(`Total settled data from total commission payout breakdown table: `, totalSettledAmount)

                // Add settled data to categoryData
                settledData.forEach((summary) => {
                    if (!categoryData[summary.categoryName]) {
                        categoryData[summary.categoryName] = {pending: [], settled: []};
                    }
                    categoryData[summary.categoryName].settled.push(summary);
                });

                // pIds = [userId];

                const settledUserIdsSet = new Set(settledUserIds);
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

                // Fetch settled data for goldens
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

                settledGids = settledData.map((data) => data.userId);

                // Add settled data to categoryData
                settledData.forEach((summary) => {
                    if (!categoryData[summary.categoryName]) {
                        categoryData[summary.categoryName] = {pending: [], settled: []};
                    }
                    categoryData[summary.categoryName].settled.push(summary);
                });

                gIds = [...goldens.map((golden) => golden.id)];

                const settledUserIdsSet = new Set(settledGids);

                pendingPaymentGatewayFee = await this.getPaymentGatewayFee(
                    gIds.filter((id) => !settledUserIdsSet.has(id)),
                    false,
                    undefined,
                    undefined
                );

                settledPaymentGatewayFee = await this.getPaymentGatewayFee(
                    [userId],
                    true,
                    undefined,
                    undefined
                );
            }

            if (roleName === UserRole.GOLDEN) {
                // No settled data for golden as they do not settle to anyone
                Object.keys(categoryData).forEach((category) => {
                    categoryData[category].settled = [];
                });

                gIds = [userId];

                pendingPaymentGatewayFee = await this.getPaymentGatewayFee(
                    gIds,
                    false,
                    undefined,
                    undefined
                );
            }

            // console.log({
            //   eGamesCommissionPercentage,
            //   specialtyGamesRNGCommissionPercentage,
            //   specialtyGamesToteCommissionPercentage,
            // });

            // Initialize an object to store category-specific data

            let cycleStartDate: Date;
            let cycleEndDate: Date;

            let settledIds = new Set([
                ...settledOids,
                ...settledPids,
                ...settledGids,
            ]);

            let filteredUserIds = userIds.filter((id) => !settledIds.has(id));

            const {
                cycleStartDate: startDateForPgFee,
                cycleEndDate: endDateForPgFee,
            } = await this.getPreviousCompletedCycleDates();

            // console.log({feeSummaries})

            // Get cycle dates for each category and fetch data
            for (const category of Object.keys(categoryData)) {
                // Get category-specific cycle dates
                const cycleDates = await this.getPreviousCompletedCycleDates(category);
                cycleStartDate = cycleDates.cycleStartDate;
                cycleEndDate = cycleDates.cycleEndDate;

                console.log({cycleStartDate, cycleEndDate});

                // console.log({ settledPaymentGatewayFees });

                // console.log({ category, cycleStartDate, cycleEndDate, userId });


                // console.log({category: ownCommissionData[category]}, category, ownCommissionData, "<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>")


                // Get pending settlement data for this category
                let pendingData = await prisma.commissionSummary.findMany({
                    where: {
                        userId: {
                            in: roleName === UserRole.GOLDEN ? [userId] : [...userIds],
                        },
                        categoryName: category,
                        createdAt: {
                            gte: cycleStartDate,
                            lte: cycleEndDate,
                        },
                        ...(roleName === UserRole.SUPER_ADMIN
                            ? {settledBySuperadmin: false}
                            : {}),
                        ...(roleName === UserRole.OPERATOR
                            ? {settledByOperator: false}
                            : {}),
                        ...(roleName === UserRole.PLATINUM
                            ? {settledByPlatinum: false}
                            : {}),
                        settledStatus:
                            roleName === UserRole.GOLDEN ? {in: ["Y", "N"]} : "N",
                    },
                });

                const commission = pendingData
                    .filter(doc => {
                        if (roleName === UserRole.SUPER_ADMIN) return oIds.includes(doc.userId);
                        if (roleName === UserRole.OPERATOR) return pIds.includes(doc.userId);
                        if (roleName === UserRole.PLATINUM) return userIds.includes(doc.userId);
                        return false;
                    })
                    .reduce((acc, curr) => acc + (curr.parentCommission || 0), 0);

                pendingData.map((doc) => {
                    console.log(`${category} parent commission: `, doc.parentCommission);
                })


                roleName !== UserRole.SUPER_ADMIN &&
                roleName !== UserRole.GOLDEN &&
                category !== "Unknown"
                    ? (ownCommissionData[category].pending = commission || 0)
                    : 0;

                console.log(`Commission summaries from ---------------------`, pendingData)

                // console.log(`Pending Data: `, pendingData)

                const totalPendingCommission = pendingData.reduce(
                    (acc, curr) => acc + (curr.netCommissionAvailablePayout || 0),
                    0
                );

                console.log(`Total Pending Commission for ${category}:`, totalPendingCommission);

                // console.log(`Pending Data for ${category} for userIds: (${userIds})`, pendingData);

                // if (category === "Sports Betting") {
                //     console.log(`Category: ${category}, Pending Data:`, pendingData, `for userIds: (${userIds}) for cycle from ${cycleStartDate} to ${cycleEndDate}`);
                // }

                categoryData[category].pending = pendingData;
            }

            const cycleDates = await this.getPreviousCompletedCycleDates("E-Games");

            cycleStartDate = cycleDates.cycleStartDate;
            cycleEndDate = cycleDates.cycleEndDate;

            // Initialize category totals
            const categoryTotals = {
                pending: {
                    egames: {amount: 0, grossCommission: 0},
                    sports: {amount: 0, grossCommission: 0},
                    specialtyGamesRng: {amount: 0, grossCommission: 0},
                    specialtyGamesTote: {amount: 0, grossCommission: 0},
                    totalGrossCommission: 0,
                    totalPaymentGatewayFees: 0,
                    netCommissionPayout: 0,
                },
                settled: {
                    egames: {amount: 0, grossCommission: 0},
                    sports: {amount: 0, grossCommission: 0},
                    specialtyGamesRng: {amount: 0, grossCommission: 0},
                    specialtyGamesTote: {amount: 0, grossCommission: 0},
                    totalGrossCommission: 0,
                    totalPaymentGatewayFees: 0,
                    netCommissionPayout: 0,
                },
            };

            // Process E-Games pending data
            categoryData["E-Games"].pending.forEach((summary) => {
                categoryTotals.pending.egames.amount +=
                    summary.netCommissionAvailablePayout || 0;
                categoryTotals.pending.egames.grossCommission +=
                    summary.grossCommission || 0;
                categoryTotals.pending.totalGrossCommission += summary.netGGR || 0;
                categoryTotals.pending.totalPaymentGatewayFees +=
                    summary.paymentGatewayFee || 0;
                categoryTotals.pending.netCommissionPayout +=
                    summary.netCommissionAvailablePayout || 0;
            });

            // Process Sports Betting pending data
            categoryData["Sports Betting"].pending.forEach((summary) => {
                categoryTotals.pending.sports.amount +=
                    summary.netCommissionAvailablePayout || 0;
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

            categoryData["Speciality Games - RNG"].pending.forEach((summary) => {
                categoryTotals.pending.specialtyGamesRng.amount +=
                    summary.netCommissionAvailablePayout || 0;
                categoryTotals.pending.specialtyGamesRng.grossCommission +=
                    summary.grossCommission || 0;
                categoryTotals.pending.totalGrossCommission +=
                    summary.grossCommission || 0;
                categoryTotals.pending.totalPaymentGatewayFees +=
                    summary.paymentGatewayFee || 0;
                categoryTotals.pending.netCommissionPayout +=
                    summary.netCommissionAvailablePayout || 0;
            });

            categoryData["Speciality Games - Tote"].pending.forEach((summary) => {
                categoryTotals.pending.specialtyGamesTote.amount +=
                    summary.netCommissionAvailablePayout || 0;
                categoryTotals.pending.specialtyGamesTote.grossCommission +=
                    summary.grossCommission || 0;
                categoryTotals.pending.totalGrossCommission +=
                    summary.grossCommission || 0;
                categoryTotals.pending.totalPaymentGatewayFees +=
                    summary.paymentGatewayFee || 0;
                categoryTotals.pending.netCommissionPayout +=
                    summary.netCommissionAvailablePayout || 0;
            });

            // console.log({
            //   categoryDataTestEGames: categoryData["E-Games"].settled,
            //   categoryDataTestSB: categoryData["Sports Betting"].settled,
            // })

            // Process E-Games settled data
            if (categoryData["E-Games"].settled) {
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
            }

            // Process Sports Betting settled data
            if (categoryData["Sports Betting"].settled) {
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
            }

            if (categoryData["Speciality Games - RNG"].settled) {
                categoryData["Speciality Games - RNG"].settled.forEach((summary) => {
                    categoryTotals.settled.specialtyGamesRng.amount +=
                        summary.netCommissionAvailablePayout || 0;
                    categoryTotals.settled.specialtyGamesRng.grossCommission +=
                        summary.grossCommission || 0;
                    categoryTotals.settled.totalGrossCommission +=
                        summary.grossCommission || 0;
                    categoryTotals.settled.totalPaymentGatewayFees +=
                        summary.paymentGatewayFee || 0;
                    categoryTotals.settled.netCommissionPayout +=
                        summary.netCommissionAvailablePayout || 0;
                });
            }

            if (categoryData["Speciality Games - Tote"].settled) {
                categoryData["Speciality Games - Tote"].settled.forEach((summary) => {
                    categoryTotals.settled.specialtyGamesTote.amount +=
                        summary.netCommissionAvailablePayout || 0;
                    categoryTotals.settled.specialtyGamesTote.grossCommission +=
                        summary.grossCommission || 0;
                    categoryTotals.settled.totalGrossCommission +=
                        summary.grossCommission || 0;
                    categoryTotals.settled.totalPaymentGatewayFees +=
                        summary.paymentGatewayFee || 0;
                    categoryTotals.settled.netCommissionPayout +=
                        summary.netCommissionAvailablePayout || 0;
                });
            }


            const totalPendingGrossCommission =
                categoryTotals.pending.egames.amount +
                categoryTotals.pending.sports.amount +
                categoryTotals.pending.specialtyGamesRng.amount +
                categoryTotals.pending.specialtyGamesTote.amount;

            const totalSettledGrossCommission =
                categoryTotals.settled.egames.amount +
                categoryTotals.settled.sports.amount +
                categoryTotals.settled.specialtyGamesRng.amount +
                categoryTotals.settled.specialtyGamesTote.amount;

            // const totalSettledNetCommissionPayout =
            //     totalSettledGrossCommission > 0
            //         ? totalSettledGrossCommission - settledPaymentGatewayFee
            //         : 0;

            const totalSettledNetCommissionPayoutWithoutPGFeeDeduction = totalSettledGrossCommission

            // console.log(`Pending payment gateway fee sum: ${pendingPaymentGatewayFeeSum}`);

            // console.log({
            //   categoryTotalsSettled: categoryTotals.settled
            // })

            const pendingOwnCommission = totalPendingGrossCommission == 0 ? 0 :
                ownCommissionData["E-Games"].pending +
                ownCommissionData["Sports Betting"].pending +
                ownCommissionData["Speciality Games - RNG"].pending +
                ownCommissionData["Speciality Games - Tote"].pending;

            const totalPendingCommission = totalPendingGrossCommission == 0 ? 0 :
                totalPendingGrossCommission +
                ownCommissionData["E-Games"].pending +
                ownCommissionData["Sports Betting"].pending +
                ownCommissionData["Speciality Games - RNG"].pending +
                ownCommissionData["Speciality Games - Tote"].pending;

            // const finalPendingAmount = totalPendingCommission -
            //     pendingPaymentGatewayFeeSum -
            //     pendingOwnCommission

            const finalPendingAmountWithoutPGFeeDeduction = totalPendingCommission == 0 ? 0 : totalPendingCommission -
                pendingOwnCommission

            // console.log({totalPendingCommission, finalPendingAmount, ownCommission, pendingPaymentGatewayFeeSum})

            // console.log(`Category Totals: `, categoryTotals);

            const totalEGames = categoryTotals.pending.egames.amount == 0 ? 0 : categoryTotals.pending.egames.amount +
                ownCommissionData["E-Games"].pending

            const totalSportsBetting = categoryTotals.pending.sports.amount == 0 ? 0 : categoryTotals.pending.sports.amount +
                ownCommissionData["Sports Betting"].pending

            const totalRng = categoryTotals.pending.specialtyGamesRng.amount == 0 ? 0 : categoryTotals.pending.specialtyGamesRng.amount +
                ownCommissionData["Speciality Games - RNG"].pending

            const totalTote = categoryTotals.pending.specialtyGamesTote.amount == 0 ? 0 : categoryTotals.pending.specialtyGamesTote.amount +
                ownCommissionData["Speciality Games - Tote"].pending

            const totalPendingGross = totalPendingCommission == 0 ? 0 : totalPendingGrossCommission +
                ownCommissionData["E-Games"].pending +
                ownCommissionData["Sports Betting"].pending +
                ownCommissionData["Speciality Games - RNG"].pending +
                ownCommissionData["Speciality Games - Tote"].pending

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
                        pendingSettlement: totalEGames,
                        settledAllTime: categoryTotals.settled.egames.amount,
                    },
                    {
                        label: "Total Sports Betting",
                        pendingSettlement: totalSportsBetting,
                        settledAllTime: categoryTotals.settled.sports.amount,
                    },
                    {
                        label: "Total Speciality Games - RNG",
                        pendingSettlement: totalRng,
                        settledAllTime: categoryTotals.settled.specialtyGamesRng.amount,
                    },
                    {
                        label: "Total Speciality Games - Tote",
                        pendingSettlement: totalTote,
                        settledAllTime: categoryTotals.settled.specialtyGamesTote.amount,
                    },
                    {
                        label: "Gross Commissions",
                        pendingSettlement: totalPendingGross,
                        settledAllTime: totalSettledGrossCommission,
                    },
                    ...(roleName !== UserRole.GOLDEN
                        ? [
                            {
                                label: "Less: Own Commission",
                                pendingSettlement: pendingOwnCommission,
                                settledAllTime: 0,
                                note: "(Gross Commission less Payment Gateway Fees)",
                            },
                        ]
                        : []),
                    {
                        label:
                            roleName === UserRole.GOLDEN
                                ? "Net Commission"
                                : "Commission Available for Payout",
                        pendingSettlement: finalPendingAmountWithoutPGFeeDeduction,
                        settledAllTime:
                            roleName === UserRole.GOLDEN
                                ? totalSettledGrossCommission
                                : totalSettledNetCommissionPayoutWithoutPGFeeDeduction,
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

                const commissionSummaries = await prisma.commissionSummary.findMany({
                    where: {
                        userId: userId,
                        categoryName: category,
                        createdAt: {
                            gte: cycleStartDate,
                            lte: cycleEndDate,
                        },
                    },
                });

                let totalCommission = 0;
                let settledBySuperAdmin = false;
                let settledByOperator = false;
                let settledByPlatinum = false;

                for (const summary of commissionSummaries) {
                    totalCommission += summary.netCommissionAvailablePayout || 0;
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
                    select: {id: true},
                })
                .then((users) => users.map((user) => user.id));

            let restUserIds = [];

            if (roleName === UserRole.SUPER_ADMIN) {
                const oIds = childrenIds;

                const platinums = await prisma.user.findMany({
                    where: {
                        parentId: {in: oIds},
                        role: {name: UserRole.PLATINUM},
                    },
                    select: {id: true},
                });

                restUserIds = platinums.map((platinum) => platinum.id);

                const goldens = await prisma.user.findMany({
                    where: {
                        parentId: {in: platinums.map((platinum) => platinum.id)},
                        role: {name: UserRole.GOLDEN},
                    },
                    select: {id: true},
                });

                restUserIds = [...restUserIds, ...goldens.map((golden) => golden.id)];

                // console.log({restUserIds})
            }

            if (roleName === UserRole.OPERATOR) {
                const pIds = childrenIds;

                const goldens = await prisma.user.findMany({
                    where: {
                        parentId: {in: pIds},
                    },
                    select: {id: true},
                });

                restUserIds = goldens.map((golden) => golden.id);
            }

            const categories = [
                "E-Games",
                "Sports Betting",
                "Speciality Games - RNG",
                "Speciality Games - Tote",
            ];

            let commissionSummaries = [];
            let restCommissionSummaries = [];

            for (const category of categories) {
                const {cycleStartDate, cycleEndDate} =
                    await this.getPreviousCompletedCycleDates(category);

                const summaries = await prisma.commissionSummary.findMany({
                    where: {
                        userId: {in: childrenIds},
                        createdAt: {
                            gte: cycleStartDate,
                            lte: cycleEndDate,
                        },
                        settledStatus: "N",
                        categoryName: category,
                    },
                    select: {
                        id: true,
                        user: true,
                        totalDeposit: true,
                        totalWithdrawals: true,
                        totalBetAmount: true,
                        createdAt: true,
                        netGGR: true,
                        paymentGatewayFee: true,
                        netCommissionAvailablePayout: true,
                        categoryName: true,
                        parentCommission: true
                    },
                });

                const restSummaries = await prisma.commissionSummary.findMany({
                    where: {
                        userId: {in: restUserIds},
                        createdAt: {
                            gte: cycleStartDate,
                            lte: cycleEndDate,
                        },
                        settledStatus: "N",
                        categoryName: category,
                    },
                    select: {
                        id: true,
                        user: true,
                        totalDeposit: true,
                        totalWithdrawals: true,
                        totalBetAmount: true,
                        createdAt: true,
                        netGGR: true,
                        paymentGatewayFee: true,
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

                commissionSummaries = shouldConcat ? commissionSummaries.concat(summaries) : commissionSummaries.concat([]);
                restCommissionSummaries = shouldConcat ? restCommissionSummaries.concat(restSummaries) : restCommissionSummaries.concat([]);

                // commissionSummaries = commissionSummaries.concat(summaries)
                // restCommissionSummaries = restCommissionSummaries.concat(restSummaries)
                // console.log({restSummaries})
            }

            console.log({commissionSummaries})

            // Group commissionSummaries by userId to avoid duplicates
            const summariesByUserId = {};

            for (const summary of commissionSummaries) {
                if (!summariesByUserId[summary.user.id]) {
                    summariesByUserId[summary.user.id] = [];
                }
                summariesByUserId[summary.user.id].push(summary);
            }

            // Transform data into required format - one row per user/network
            const rows = await Promise.all(
                Object.values(summariesByUserId).map(async (userSummaries) => {
                    // Use the first summary to get user details
                    const summary = userSummaries[0];

                    (userSummaries as any[]).map((summary) => {
                        console.log(`Parent commission is: `, summary.parentCommission)
                    })

                    const ownCommission = (userSummaries as any[]).reduce((acc, cur) => acc += (cur.parentCommission || 0), 0)

                    const summariesByUser = (userSummaries as any[]).reduce(
                        (acc, summary) => {
                            if (!acc.summaries) {
                                acc.summaries = [];
                                acc.network = summary.user.username || "Unknown";
                                acc.bankName = summary.user.bankName;
                                acc.ids = [];
                                acc.totalEgamesCommissions = 0;
                                acc.totalSportsBettingCommissions = 0;
                                acc.totalSpecialtyGamesRNGCommissions = 0;
                                acc.totalSpecialtyGamesToteCommissions = 0;
                                acc.grossCommissions = 0;
                                acc.paymentGatewayFees = 0;
                                acc.netCommissions = 0;
                                acc.restCommissionIds = [];
                            }

                            acc.summaries.push(summary);

                            acc.ids.push(summary.id);

                            // Calculate totals by game category
                            if (summary.categoryName.includes("E-Games")) {
                                acc.totalEgamesCommissions +=
                                    summary.netCommissionAvailablePayout || 0;
                            } else if (summary.categoryName.includes("Sports Betting")) {
                                acc.totalSportsBettingCommissions +=
                                    summary.netCommissionAvailablePayout || 0;
                            } else if (
                                summary.categoryName.includes("Speciality Games - RNG")
                            ) {
                                acc.totalSpecialtyGamesRNGCommissions +=
                                    summary.netCommissionAvailablePayout || 0;
                            } else if (
                                summary.categoryName.includes("Speciality Games - Tote")
                            ) {
                                acc.totalSpecialtyGamesToteCommissions +=
                                    summary.netCommissionAvailablePayout || 0;
                            }

                            const totalGrossCommissions =
                                acc.totalEgamesCommissions +
                                acc.totalSportsBettingCommissions +
                                acc.totalSpecialtyGamesCommissions;

                            // Update overall totals
                            acc.grossCommissions += summary.netGGR || 0;
                            acc.paymentGatewayFees += summary.paymentGatewayFee || 0;
                            acc.netCommissions += summary.netCommissionAvailablePayout || 0;

                            return acc;
                        },
                        {} as any
                    );

                    //  console.log({userRole: summary.user})

                    // Add commissions from restCommissionSummaries for this user's hierarchy
                    const userRole = await this.roleDao
                        .getRoleById(summary.user.roleId)
                        .then((role) => role.name);

                    // console.log({userRole})

                    // Initialize arrays to store relevant users at each level of the hierarchy
                    let relevantRestUsers = [];

                    // Get all user roles ahead of time
                    const restUserRoles = await Promise.all(
                        restCommissionSummaries.map(async (restUser) => {
                            const user = await this.userDao.getUserByUserId(restUser.user.id);
                            const role = await this.roleDao
                                .getRoleById(user.roleId)
                                .then((role) => role.name);
                            return {
                                userId: user.id,
                                parentId: user.parentId,
                                role: role,
                            };
                        })
                    ); // Get all user information upfront, including parent relationships
                    const userInfoMap = {};
                    for (const role of restUserRoles) {
                        userInfoMap[role.userId] = {
                            parentId: role.parentId,
                            role: role.role,
                        };
                    }

                    // Create filtered lists based on direct parent-child relationships
                    if (userRole === UserRole.SUPER_ADMIN) {
                        // Get direct platinum descendants of this operator
                        const platinumUsers = restCommissionSummaries.filter(
                            (restUser) =>
                                userInfoMap[restUser.user.id] &&
                                userInfoMap[restUser.user.id].parentId === summary.user.id &&
                                userInfoMap[restUser.user.id].role === UserRole.PLATINUM
                        );

                        // Add these PLATINUM users to our relevant users
                        relevantRestUsers = [...platinumUsers];

                        // Get GOLDEN users who are direct children of those PLATINUM users
                        const platinumUserIds = platinumUsers.map((p) => p.user.id);
                        const goldenUsers = restCommissionSummaries.filter(
                            (restUser) =>
                                userInfoMap[restUser.user.id] &&
                                platinumUserIds.includes(
                                    userInfoMap[restUser.user.id].parentId
                                ) &&
                                userInfoMap[restUser.user.id].role === UserRole.GOLDEN
                        );

                        // Add these GOLDEN users to our relevant users
                        relevantRestUsers = [...relevantRestUsers, ...goldenUsers];
                    } else if (userRole === UserRole.OPERATOR) {
                        // Get direct platinum descendants
                        const platinumUsers = restCommissionSummaries.filter(
                            (restUser) =>
                                userInfoMap[restUser.user.id] &&
                                userInfoMap[restUser.user.id].parentId === summary.user.id &&
                                userInfoMap[restUser.user.id].role === UserRole.PLATINUM
                        );

                        // Add these PLATINUM users to our relevant users
                        relevantRestUsers = [...platinumUsers];

                        // Get GOLDEN users who are direct children of those PLATINUM users
                        const platinumUserIds = platinumUsers.map((p) => p.user.id);
                        const goldenUsers = restCommissionSummaries.filter(
                            (restUser) =>
                                userInfoMap[restUser.user.id] &&
                                platinumUserIds.includes(
                                    userInfoMap[restUser.user.id].parentId
                                ) &&
                                userInfoMap[restUser.user.id].role === UserRole.GOLDEN
                        );

                        // Add these GOLDEN users to our relevant users
                        relevantRestUsers = [...relevantRestUsers, ...goldenUsers];
                    } else if (userRole === UserRole.PLATINUM) {
                        // For PLATINUM, we only need direct GOLDEN children
                        const goldenUsers = restCommissionSummaries.filter(
                            (restUser) =>
                                userInfoMap[restUser.user.id] &&
                                userInfoMap[restUser.user.id].parentId === summary.user.id &&
                                userInfoMap[restUser.user.id].role === UserRole.GOLDEN
                        );

                        // Add these GOLDEN users to our relevant users
                        relevantRestUsers = [...goldenUsers];
                    }
                    // GOLDEN users don't have any descendants in this hierarchy, so no special case needed

                    // if (summary.rest)          console.log({relevantRestUsers})          // Initialize rest commission IDs array if it doesn't exist
                    if (!summariesByUser.restCommissionIds) {
                        summariesByUser.restCommissionIds = [];
                    }

                    // Process each relevant rest user directly from restCommissionSummaries
                    // instead of looking up their commissions again
                    for (const restSummary of relevantRestUsers) {
                        // Only process if we haven't already included this commission ID
                        if (!summariesByUser.restCommissionIds.includes(restSummary.id)) {
                            // Add to list of rest commission IDs
                            summariesByUser.restCommissionIds.push(restSummary.id);

                            // Calculate totals by game category
                            if (restSummary.categoryName.includes("E-Games")) {
                                summariesByUser.totalEgamesCommissions +=
                                    restSummary.netCommissionAvailablePayout || 0;
                            } else if (restSummary.categoryName.includes("Sports Betting")) {
                                summariesByUser.totalSportsBettingCommissions +=
                                    restSummary.netCommissionAvailablePayout || 0;
                            } else if (
                                restSummary.categoryName.includes("Speciality Games - RNG") ||
                                restSummary.categoryName.includes("Speciality Games - Tote")
                            ) {
                                summariesByUser.totalSpecialtyGamesCommissions +=
                                    restSummary.netCommissionAvailablePayout || 0;
                            }

                            // Update overall totals
                            summariesByUser.grossCommissions += restSummary.netGGR || 0;
                            summariesByUser.paymentGatewayFees +=
                                restSummary.paymentGatewayFee || 0;
                            summariesByUser.netCommissions +=
                                restSummary.netCommissionAvailablePayout || 0;
                        }
                    }


                    if (
                        !summariesByUser.summaries ||
                        summariesByUser.summaries.length === 0
                    ) {
                        return [];
                    }

                    const totalEgamesCommissions = summariesByUser.totalEgamesCommissions
                    const totalSportsBettingCommissions = summariesByUser.totalSportsBettingCommissions
                    const totalSpecialtyGamesRNGCommissions = summariesByUser.totalSpecialtyGamesRNGCommissions
                    const totalSpecialtyGamesToteCommissions = summariesByUser.totalSpecialtyGamesToteCommissions


                    const grossCommissions = totalEgamesCommissions + totalSportsBettingCommissions + totalSpecialtyGamesRNGCommissions + totalSpecialtyGamesToteCommissions + ownCommission

                    // const netCommissions = grossCommissions - pendingPaymentGatewayFees;

                    // const netCommissionsWithoutPGFeeDeduction = grossCommissions

                    const netCommissions = grossCommissions - ownCommission


                    // const netCommissionsAfterDeductingOwnCommission = netCommissions - ownCommission

                    // Create a unified row for this user with all category totals
                    return {
                        ids: summariesByUser.ids, // Keep only the original childrenIds
                        network: summariesByUser.network,
                        totalEgamesCommissions: totalEgamesCommissions,
                        bankName: summariesByUser.bankName,
                        totalSportsBettingCommissions:
                        totalSportsBettingCommissions,
                        totalSpecialtyGamesRNGCommissions:
                        totalSpecialtyGamesRNGCommissions,
                        totalSpecialtyGamesToteCommissions:
                        totalSpecialtyGamesToteCommissions,
                        restCommissionIds: summariesByUser.restCommissionIds,
                        grossCommissions,
                        // paymentGatewayFees: pendingPaymentGatewayFees,
                        ownCommission: ownCommission,
                        netCommissions: netCommissions,
                        transferableAmount: netCommissions < 0 ? 0 : netCommissions,
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

            // console.log("eGamesCycle----------------------", eGamesCycle);
            // console.log("sportsCycle----------------------", sportsCycle);
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
                commissionSettled: number
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
                            pendingSettlement: commissionPending,
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
            const summaries = await prisma.commissionSummary.findMany({
                where: {
                    OR: [
                        {
                            AND: [
                                {userId: userId},
                                {categoryName: "E-Games"},
                                {
                                    createdAt: {
                                        gte: eGamesCycle.cycleStartDate,
                                        lte: eGamesCycle.cycleEndDate,
                                    },
                                },
                            ],
                        },
                        {
                            AND: [
                                {userId: userId},
                                {categoryName: "Sports Betting"},
                                {
                                    createdAt: {
                                        gte: sportsCycle.cycleStartDate,
                                        lte: sportsCycle.cycleEndDate,
                                    },
                                },
                            ],
                        },
                    ],
                },
                select: {
                    categoryName: true,
                    settledStatus: true,
                    netGGR: true,
                    totalBetAmount: true,
                    grossCommission: true,
                    netCommissionAvailablePayout: true,
                    paymentGatewayFee: true,
                    pendingSettleCommission: true,
                    settledBySuperadmin: true,
                    settledByOperator: true,
                    settledByPlatinum: true,
                },
            });

            const pending = {
                eGamesGGR: 0,
                eGamesCommission: 0,
                sportsBet: 0,
                sportsCommission: 0,
                ownerCommission: 0,
            };

            const settled = {
                eGamesGGR: 0,
                eGamesCommission: 0,
                sportsBet: 0,
                sportsCommission: 0,
            };

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

                const operatorSummaries = await prisma.commissionSummary.findMany({
                    where: {
                        OR: [
                            {
                                AND: [
                                    {userId: {in: operatorIds}},
                                    {categoryName: "E-Games"},
                                    {settledStatus: "N"},
                                    {
                                        createdAt: {
                                            gte: eGamesCycle.cycleStartDate,
                                            lte: eGamesCycle.cycleEndDate,
                                        },
                                    },
                                ],
                            },
                            {
                                AND: [
                                    {userId: {in: operatorIds}},
                                    {categoryName: "Sports Betting"},
                                    {settledStatus: "N"},
                                    {
                                        createdAt: {
                                            gte: sportsCycle.cycleStartDate,
                                            lte: sportsCycle.cycleEndDate,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    select: {
                        categoryName: true,
                        netGGR: true,
                        totalBetAmount: true,
                        pendingSettleCommission: true,
                        settledStatus: true,
                    },
                });

                let egamesGGR = 0;
                let sportsGGR = 0;
                let egamesCommission = 0;
                let sportsCommission = 0;
                let settledEGamesGGR = 0;
                let settledSportsGGR = 0;

                let settledEGamesCommission = 0;
                let settledSportsCommission = 0;

                for (const summary of operatorSummaries) {
                    if (summary.categoryName === "E-Games") {
                        const ggr = summary.netGGR;
                        const comm = summary.pendingSettleCommission;

                        // console.log("pending commission", comm, "ggr", ggr)

                        egamesGGR += ggr;
                        console.log("total commission", ggr)
                        egamesCommission += comm;

                        // if (summary.settledStatus === "Y") {
                        //     egamesCommission = comm - comm;
                        //     settledEGamesGGR += ggr;
                        //     settledEGamesCommission += comm;
                        // }
                    } else if (summary.categoryName === "Sports Betting") {
                        const bet = summary.totalBetAmount;
                        const comm = summary.pendingSettleCommission;

                        sportsGGR += bet;
                        sportsCommission += comm;

                        // console.log("pending commission-----------------", sportsCommission)

                        // if (summary.settledStatus === "Y") {
                        //     sportsCommission = comm - comm;

                        //     settledSportsGGR += bet;
                        //     settledSportsCommission += comm;
                        // }
                    }
                }

                // Assign values to your pending and settled trackers
                pending.eGamesGGR = egamesGGR;
                pending.eGamesCommission = egamesCommission;
                pending.sportsBet = sportsGGR;
                pending.sportsCommission = sportsCommission;

                // settled.eGamesGGR = settledEGamesGGR; // as per your requirement
                // settled.eGamesCommission = settledEGamesCommission;
                // settled.sportsBet = settledSportsGGR; // as per your requirement
                // settled.sportsCommission = settledSportsCommission;

                // console.log("pending commission", pending.eGamesCommission, "comm", pending.sportsCommission, "grossCommission", pending.eGamesGGR)
            }

            for (const summary of summaries) {
                const category = summary.categoryName;
                const grossCommission = summary.grossCommission;
                const ggr = summary.netGGR;
                const bet = summary.totalBetAmount;
                const comm = summary.netCommissionAvailablePayout;
                const pendingComm = summary.pendingSettleCommission;
                const paymentGatewayFee = summary.paymentGatewayFee;
                const isSettled = summary.settledStatus === "Y";
                const settledBySuperadmin = summary.settledBySuperadmin
                const settledByOperator = summary.settledByOperator;
                const settledByPlatinum = summary.settledByPlatinum;


                if (category === "E-Games") {
                    if (roleName === UserRole.OPERATOR) {
                        // Condition 1: Only unsettled (settledStatus == 'N')
                        if (!settledBySuperadmin) {
                            pending.eGamesGGR += ggr;
                            pending.eGamesCommission += pendingComm;
                        } else if (settledBySuperadmin && !settledByOperator) {
                            // Only Superadmin settled
                            const childUsers = await prisma.user.findMany({
                                where: {parentId: userId},
                                select: {id: true},
                            });
                            const childUserIds = childUsers.map(user => user.id);

                            if (childUserIds.length > 0) {
                                const childSummaries = await prisma.commissionSummary.findMany({
                                    where: {
                                        userId: {in: childUserIds},
                                        categoryName: 'E-Games',
                                        settledStatus: 'N',
                                    },
                                    select: {
                                        pendingSettleCommission: true,
                                        netGGR: true,
                                    },
                                });

                                const totalPendingCommission = childSummaries.reduce((sum, summary) => sum + Number(summary.pendingSettleCommission || 0), 0);
                                const totalNetCommission = childSummaries.reduce((sum, summary) => sum + Number(summary.netGGR || 0), 0);

                                pending.eGamesGGR = totalNetCommission;
                                pending.eGamesCommission = totalPendingCommission;
                            }
                        } else if (settledBySuperadmin && settledByOperator) {
                            pending.eGamesGGR += ggr;
                            const childUsers = await prisma.user.findMany({
                                where: {parentId: userId},
                                select: {id: true},
                            });
                            const childUserIds = childUsers.map(user => user.id);

                            if (childUserIds.length > 0) {
                                const childSummaries = await prisma.commissionSummary.findMany({
                                    where: {
                                        userId: {in: childUserIds},
                                        categoryName: 'E-Games',
                                        settledStatus: 'N',
                                    },
                                    select: {
                                        pendingSettleCommission: true,
                                        netGGR: true,
                                    },
                                });

                                const totalPendingCommission = childSummaries.reduce((sum, summary) => sum + Number(summary.pendingSettleCommission || 0), 0);
                                const totalNetCommission = childSummaries.reduce((sum, summary) => sum + Number(summary.netGGR || 0), 0);

                                pending.eGamesGGR = totalNetCommission;
                                pending.eGamesCommission = totalPendingCommission;
                            }
                        }
                    }
                    if (roleName === UserRole.GOLDEN) {
                        pending.eGamesGGR += ggr;
                        pending.eGamesCommission += comm;
                    } else if (roleName === UserRole.PLATINUM) {
                        pending.eGamesGGR += ggr;
                        const childUsers = await prisma.user.findMany({
                            where: {parentId: userId},
                            select: {id: true},
                        });
                        const childUserIds = childUsers.map(user => user.id);

                        if (childUserIds.length > 0) {
                            const childSummaries = await prisma.commissionSummary.findMany({
                                where: {
                                    userId: {in: childUserIds},
                                    categoryName: 'E-Games',
                                    settledStatus: 'N',
                                },
                                select: {
                                    pendingSettleCommission: true,
                                  netGGR: true,
                                  netCommissionAvailablePayout: true,
                                    parentCommission: true,
                                },
                            });
                          
                            const ParentSummaries = await prisma.commissionSummary.findMany({
                                where: {
                                    userId: userId,
                                    categoryName: 'E-Games',
                                },
                                select: {
                                    netCommissionAvailablePayout: true,
                                },
                            });


                            const parentPendingCommission = childSummaries.reduce((sum, summary) => sum + Number(summary.parentCommission || 0), 0);
                            console.log("parentPendingCommission0000000000000000000000----------------", parentPendingCommission)
                            const totalPendingCommission = childSummaries.reduce((sum, summary) => sum + Number(summary.netCommissionAvailablePayout || 0), 0);
                          const totalNetCommission = childSummaries.reduce((sum, summary) => sum + Number(summary.netGGR || 0), 0);
                          
                            pending.eGamesGGR = totalNetCommission;

                            pending.eGamesCommission = totalPendingCommission > 0 ? totalPendingCommission + parentPendingCommission : totalPendingCommission;

                          // if (!settledBySuperadmin) {

                          //   console.log("parentPendingCommission0000000000000000000000----------------", parentPendingCommission)
                          //   console.log("totalPendingCommission0000000000000000000000----------------", totalPendingCommission)

                          //   pending.eGamesGGR = totalNetCommission;
                          //   pending.eGamesCommission = totalPendingCommission + parentPendingCommission
                          // } else if (settledBySuperadmin && !settledByOperator) { 
                          //     pending.eGamesGGR = totalNetCommission;
                          //    pending.eGamesCommission = totalPendingCommission + parentPendingCommission
                          // }else if(!settledByPlatinum) {
                          //   console.log("psettle after platinum--------------------------->>>>>>>>>>.", pending.eGamesCommission)
                          //   console.log("settledByPlatinum234 platinum--------------------------->>>>>>>>>>.", settledByPlatinum)
                          //   pending.eGamesGGR = totalNetCommission;
                          //    pending.eGamesCommission = totalPendingCommission
                          // }
                          // else if (settledBySuperadmin && settledByOperator) {
                          //   console.log("psettle after 12 platinum--------------------------->>>>>>>>>>.", settledByPlatinum)
                          //    pending.eGamesGGR = totalNetCommission;
                          //    pending.eGamesCommission = totalPendingCommission  + parentPendingCommission

                          //   ;
                          // } 

                            
                           
                        }
                        console.log("pending commission", pending.eGamesCommission, "comm", pendingComm, "grossCommission", ggr)
                    }
                } else if (category === "Sports Betting") {
                    if (roleName === UserRole.OPERATOR) {
                        if (!settledBySuperadmin) {
                            pending.sportsCommission += pendingComm;
                            pending.sportsBet += bet;
                        } else if (settledBySuperadmin && !settledByOperator) {
                            const childUsers = await prisma.user.findMany({
                                where: {parentId: userId},
                                select: {id: true},
                            });
                            const childUserIds = childUsers.map(user => user.id);

                            if (childUserIds.length > 0) {
                                const childSummaries = await prisma.commissionSummary.findMany({
                                    where: {
                                        userId: {in: childUserIds},
                                        categoryName: 'Sports Betting',
                                        settledStatus: 'N',
                                    },
                                    select: {
                                        totalBetAmount: true,
                                        netCommissionAvailablePayout: true,
                                        pendingSettleCommission: true,
                                    },
                                });

                                const totalPendingBet = childSummaries.reduce((sum, summary) => sum + Number(summary.totalBetAmount || 0), 0);
                                const totalNetCommission = childSummaries.reduce((sum, summary) => sum + Number(summary.pendingSettleCommission || 0), 0);

                                pending.sportsBet = totalPendingBet;
                                pending.sportsCommission = totalNetCommission;
                            }
                        } else if (settledBySuperadmin && settledByOperator) {
                            pending.sportsBet += bet;
                            const childUsers = await prisma.user.findMany({
                                where: {parentId: userId},
                                select: {id: true},
                            });
                            const childUserIds = childUsers.map(user => user.id);

                            if (childUserIds.length > 0) {
                                const childSummaries = await prisma.commissionSummary.findMany({
                                    where: {
                                        userId: {in: childUserIds},
                                        categoryName: 'Sports Betting',
                                        settledStatus: 'N',
                                    },
                                    select: {
                                        totalBetAmount: true,
                                        netCommissionAvailablePayout: true,
                                    },
                                });

                                const totalPendingBet = childSummaries.reduce((sum, summary) => sum + Number(summary.totalBetAmount || 0), 0);
                                const totalNetCommission = childSummaries.reduce((sum, summary) => sum + Number(summary.netCommissionAvailablePayout || 0), 0);

                                pending.sportsBet = totalPendingBet;
                                pending.sportsCommission = totalNetCommission;
                            }
                        }
                    }
                    if (roleName === UserRole.GOLDEN) {
                        pending.sportsBet += bet;
                        pending.sportsCommission += comm;
                    } else if (roleName === UserRole.PLATINUM) {
                      const childUsers = await prisma.user.findMany({
                        where: { parentId: userId },
                        select: { id: true },
                      });
                      const childSummaries = await prisma.commissionSummary.findMany({
                        where: {
                          userId: { in: childUsers.map(user => user.id) },
                          categoryName: 'Sports Betting',
                          settledStatus: 'N',
                        },
                        select: {
                          totalBetAmount: true,
                          netCommissionAvailablePayout: true,
                          parentCommission: true,
                        },
                      });

                      const totalParentCommission = childSummaries.reduce((sum, summary) => sum + Number(summary.parentCommission || 0), 0);
                      const totalPendingBet = childSummaries.reduce((sum, summary) => sum + Number(summary.totalBetAmount || 0), 0);
                      const totalNetCommission = childSummaries.reduce((sum, summary) => sum + Number(summary.netCommissionAvailablePayout || 0), 0);

                          pending.sportsBet = totalPendingBet;
                          pending.sportsCommission = totalNetCommission + totalParentCommission;


                    }
                }

            }

            const commissionData = await prisma.commission.findMany({
                where: {
                    userId: userId, // Replace `user.id` with your logged-in user's ID
                },
                select: {
                    totalAssignedCommissionPercentage: true,
                    category: {
                        select: {
                            name: true,
                        },
                    },
                },
            });


            // Determine commission rates
            let eGamesRate = 0;
            let sportsRate = 0;
            let rngRate = 0;
            let toteRate = 0;

            switch (roleName) {
                case UserRole.SUPER_ADMIN:
                    eGamesRate = 30;
                    sportsRate = 2;
                    rngRate = 0.01;
                    toteRate = 0.01;
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


            result.data.data.push(
                buildLicenseData(
                    "E-Games",
                    "GGR",
                    pending.eGamesGGR,
                    settled.eGamesGGR,
                    eGamesRate,
                    pending.eGamesCommission,
                    settled.eGamesCommission
                ),
                buildLicenseData(
                    "Sports Betting",
                    "Total Bet Amount",
                    pending.sportsBet,
                    settled.sportsBet,
                    sportsRate,
                    pending.sportsCommission,
                    settled.sportsCommission
                ),
                buildDefaultLicenseData(
                    "Speciality Games - Tote",
                    "Total Bet Amount",
                    "1.8%"
                ),
                buildDefaultLicenseData("Speciality Games - RNG", "GGR", "25%")
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
        roleName: UserRole
    ) {
        try {
            // Using the instance variable instead of creating a new instance
            const commissionData = await this.commissionDao.markCommissionAsSettled(
                ids,
                roleName,
                childrenCommissionIds
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
                            userId: {in: downlineIds},
                            settledStatus: "Y",
                            settledAt: {not: null},
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
                            userId: {in: downlineIds},
                            settledStatus: "Y",
                            settledAt: {not: null},
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
                    const {cycleStartDate, cycleEndDate} =
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
                return "ALL OPERATORS";
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
        if (
            categoryName === "Sports Betting" ||
            categoryName === "Speciality Games - Tote"
        ) {
            const day = currentDate.getDay(); // 0 = Sunday
            const offset = day === 0 ? 6 : day - 1; // Make Monday = 0
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - offset);
            startOfWeek.setHours(0, 0, 0, 0);

            // console.log(`Showing running tally from start of week: ${startOfWeek.toISOString()} till today: ${currentDate.toISOString()} for category: ${categoryName}`);

            return {
                cycleStartDate: startOfWeek,
                cycleEndDate: currentDate,
            };
        }

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
