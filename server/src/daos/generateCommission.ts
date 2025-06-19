// import { PrismaClient } from "@prisma/client";

import {prisma} from "../server";
import {startOfDay, endOfDay} from "date-fns";
import {UserRole} from "../common/config/constants";
import {Decimal} from "../../prisma/generated/prisma/runtime/library";
// import {Decimal} from "@prisma/client/runtime/binary";
// import Decimal from "decimal.js";

// Set global rounding mode
// Decimal.set({rounding: Decimal.ROUND_UP});

class GenerateCommission {
    public async generateCommissionSummariesByDate(dateInput: string | Date) {
        try {
            const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
            const from = startOfDay(date);
            const to = endOfDay(date);

            // console.log("date from", from, "date to", to);

            const transactions = await prisma.transaction.findMany({
                where: {betTime: {gte: from, lte: to}},
            });

            // console.log(`📦 Found ${transactions.length} transactions on ${date.toDateString()}`);

            const roleTargets = ["ownerId", "maId", "gaId"];

            for (const roleKey of roleTargets) {
                const grouped = new Map<string, Record<string, Decimal>>();

                for (const txn of transactions) {

                    // if (txn.platformType !== "E-Games") continue

                    const userId = txn[roleKey as keyof typeof txn] as string;
                    const category = txn.platformType || "Unknown";
                    if (!userId) continue;

                    const key = `${userId}|${category}`;
                    const existing = grouped.get(key) || {
                        deposit: new Decimal(0),
                        withdrawal: new Decimal(0),
                        betAmount: new Decimal(0),
                        revenue: new Decimal(0),
                        pgFeeCommission: new Decimal(0),
                        ownerCommission: new Decimal(0),
                        maCommission: new Decimal(0),
                        gaCommission: new Decimal(0)
                    };

                    let totalOwnerCommission = new Decimal(0)
                    if (txn.maName === "PLA1" && txn.platformType === "E-Games") {
                        // @ts-ignore
                        totalOwnerCommission += txn.ownerCommission
                        console.log(`Total Owner Commission: `, totalOwnerCommission)
                    }

                    grouped.set(key, {
                        deposit: existing.deposit.plus(txn.deposit || 0),
                        withdrawal: existing.withdrawal.plus(txn.withdrawal || 0),
                        betAmount: existing.betAmount.plus(txn.betAmount || 0),
                        revenue: existing.revenue.plus(txn.revenue || 0),
                        pgFeeCommission: existing.pgFeeCommission.plus(txn.pgFeeCommission || 0),
                        ownerCommission: existing.ownerCommission.plus(txn.ownerCommission || 0),
                        maCommission: existing.maCommission.plus(txn.maCommission || 0),
                        gaCommission: existing.gaCommission.plus(txn.gaCommission || 0)
                    });

                }

                for (const [key, sum] of grouped.entries()) {
                    const [userId, categoryName] = key.split("|");
                    try {
                        const user = await prisma.user.findUnique({
                            where: {id: userId},
                            select: {roleId: true, role: true, parentId: true},
                        });

                        if (!user) {
                            // console.warn(`⚠️ Role user not found: ${userId}`);
                            continue;
                        }

                        let netCommission = new Decimal(0);

                        for (const txn of transactions) {
                            const txnUserId = txn[roleKey as keyof typeof txn] as string;
                            const txnCategory = txn.platformType || "Unknown";
                            if (!txnUserId || `${txnUserId}|${txnCategory}` !== key) continue;

                            if (roleKey === "ownerId") netCommission = netCommission.plus(txn.ownerCommission || 0);
                            if (roleKey === "maId") netCommission = netCommission.plus(txn.maCommission || 0);
                            if (roleKey === "gaId") netCommission = netCommission.plus(txn.gaCommission || 0);
                        }

                        let pendingSettleCommission = new Decimal(0);
                        if (["E-Games", "Speciality Games - RNG"].includes(categoryName)) {
                            pendingSettleCommission = sum.revenue.times(0.3);
                        } else if (["Sports Betting", "Speciality Games - Tote"].includes(categoryName)) {
                            pendingSettleCommission = sum.betAmount.times(0.02);
                        }

                        let parentCommission = new Decimal(0);

                        if ([UserRole.PLATINUM, UserRole.GOLDEN].includes(user.role.name as UserRole)) {
                            const parent = await prisma.user.findUnique({where: {id: user.parentId || ""}});
                            if (parent) {
                                const commissions = await prisma.commission.findMany({
                                    where: {
                                        userId: parent.id,
                                    }, select: {
                                        commissionPercentage: true,
                                        category: true
                                    }
                                });

                                const getRate = (name: string) => {
                                    const found = commissions.find((c) => c.category?.name === name);
                                    return new Decimal(found?.commissionPercentage || 0);
                                };

                                const revenue = sum.revenue;
                                const betAmount = sum.betAmount;

                                if (categoryName === "E-Games") {
                                    parentCommission = revenue.times(getRate("E-Games")).div(100);
                                } else if (categoryName === "Speciality Games - RNG") {
                                    parentCommission = revenue.times(getRate("Speciality Games - RNG")).div(100);
                                } else if (categoryName === "Speciality Games - Tote") {
                                    parentCommission = betAmount.times(getRate("Speciality Games - Tote")).div(100);
                                } else if (categoryName === "Sports Betting") {
                                    parentCommission = betAmount.times(getRate("Sports Betting")).div(100);
                                }
                            }
                        }

                        await prisma.commissionSummary.create({
                            data: {
                                userId,
                                roleId: user.roleId,
                                categoryName,
                                totalDeposit: new Decimal(sum.deposit).toDecimalPlaces(2, Decimal.ROUND_UP).toNumber(),
                                totalWithdrawals: new Decimal(sum.withdrawal).toDecimalPlaces(2, Decimal.ROUND_UP).toNumber(),
                                totalBetAmount: new Decimal(sum.betAmount).toDecimalPlaces(2, Decimal.ROUND_UP).toNumber(),
                                netGGR: new Decimal(sum.revenue).toDecimalPlaces(2, Decimal.ROUND_UP).toNumber(),
                                grossCommission: 0,
                                paymentGatewayFee: new Decimal(sum.pgFeeCommission).toDecimalPlaces(2, Decimal.ROUND_UP).toNumber(),
                                netCommissionAvailablePayout: new Decimal(netCommission).toDecimalPlaces(2, Decimal.ROUND_UP).toNumber(),
                                pendingSettleCommission: new Decimal(pendingSettleCommission).toDecimalPlaces(2, Decimal.ROUND_UP).toNumber(),
                                parentCommission: user.role.name === UserRole.PLATINUM ? sum.ownerCommission.toNumber() : user.role.name === UserRole.GOLDEN ? sum.maCommission.toNumber() : Number(0),
                                settledStatus: "N",
                                siteId: null,
                                createdAt: date,
                                updatedAt: new Date(),
                            },
                        });

                        console.log(`✅ Summary added for ${userId} (${roleKey}) in ${categoryName}`);
                    } catch (err) {
                        console.error(`❌ Error inserting summary for ${key}:`, err);
                    }
                }
            }

            console.log(`🌟 Done generating all commission summaries for ${date.toDateString()}`);
        } catch (err) {
            console.error("🔥 Failed to generate commission summaries:", err);
        }
    }
}

export {GenerateCommission};
