// import { PrismaClient } from "@prisma/client";

import { prisma } from "../server";
import { startOfDay, endOfDay } from "date-fns";

class GenerateCommission {
  public async generateCommissionSummariesByDate(dateInput: string | Date) {
    try {
      const date =
        typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      const from = startOfDay(date);
      const to = endOfDay(date);

      // 1. Get all transactions in date range
      const transactions = await prisma.transaction.findMany({
        where: {
          betTime: {
            gte: from,
            lte: to,
          },
        },
      });

      console.log(
        `📦 Found ${transactions.length} transactions on ${date.toDateString()}`
      );

      const roleTargets = ["ownerId", "maId", "gaId"];

      for (const roleKey of roleTargets) {
        const grouped = new Map<string, { [key: string]: number }>();

        for (const txn of transactions) {
          const userId = txn[roleKey as keyof typeof txn] as string;
          const category = txn.platformType || "Unknown";
          if (!userId) continue;

          const key = `${userId}-${category}`;
          const existing = grouped.get(key) || {
            deposit: 0,
            withdrawal: 0,
            betAmount: 0,
            revenue: 0,
            pgFeeCommission: 0,
          };

          grouped.set(key, {
            deposit: existing.deposit + Number(txn.deposit || 0),
            withdrawal: existing.withdrawal + Number(txn.withdrawal || 0),
            betAmount: existing.betAmount + Number(txn.betAmount || 0),
            revenue: existing.revenue + Number(txn.revenue || 0),
            pgFeeCommission:
              existing.pgFeeCommission + Number(txn.pgFeeCommission || 0),
          });
        }

        // 2. Create summaries for each user-role combo
        for (const [key, sum] of grouped.entries()) {
          const [userId, categoryName] = key.split("-");
          try {
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { roleId: true },
            });

            if (!user) {
              console.warn(`⚠️ Role user not found: ${userId}`);
              continue;
            }

            const netCommission = sum.revenue - sum.pgFeeCommission;

            await prisma.commissionSummary.create({
              data: {
                userId,
                roleId: user.roleId,
                categoryName,
                totalDeposit: sum.deposit,
                totalWithdrawals: sum.withdrawal,
                totalBetAmount: sum.betAmount,
                netGGR: sum.revenue,
                grossCommission: 0, // optional logic
                paymentGatewayFee: sum.pgFeeCommission,
                netCommissionAvailablePayout: netCommission,
                settledStatus: "N",
                siteId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            console.log(
              `✅ Summary added for ${userId} (${roleKey}) in ${categoryName}`
            );
          } catch (err) {
            console.error(`❌ Error inserting summary for ${key}:`, err);
          }
        }
      }

      console.log(
        `🎯 Done generating all commission summaries for ${date.toDateString()}`
      );
    } catch (err) {
      console.error("🔥 Failed to generate commission summaries:", err);
    }
  }
}

export { GenerateCommission };
