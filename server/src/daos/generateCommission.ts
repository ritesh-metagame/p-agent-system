// import { PrismaClient } from "@prisma/client";

import { prisma } from "../server";

class GenerateCommission {
  public async generateCommissionSummaries(date: string) {
    const start = new Date(date);
    const end = new Date(date);
    end.setUTCDate(end.getUTCDate() + 1);
    const transactions = await prisma.transaction.findMany({
      where: {
        timeOfBet: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    });

    const platformToCategoryMap: Record<string, string> = {
      egames: "eGames",
      sportsbettings: "Sports-Bettings",
      // Add more mappings if needed
    };

    const summaryMap = new Map<
      string,
      {
        userId: string;
        roleId: string;
        categoryId: string;
        totalDeposit: number;
        totalWithdrawals: number;
        totalBetAmount: number;
        netGGR: number;
        grossCommission: number;
        netCommissionAvailablePayout: number;
      }
    >();

    for (const txn of transactions) {
      const rawPlatform = txn.platformName?.toLowerCase();
      const categoryName = platformToCategoryMap[rawPlatform ?? ""];
      if (!categoryName || !txn.agentGoldenId) continue;

      const category = await prisma.category.findUnique({
        where: { name: categoryName },
      });
      if (!category) continue;

      const categoryId = category.id;

      const goldUser = await prisma.user.findUnique({
        where: { id: txn.agentGoldenId },
        include: { role: true },
      });
      if (!goldUser || !goldUser.role) continue;

      const platinumUser = goldUser.parentId
        ? await prisma.user.findUnique({
            where: { id: goldUser.parentId },
            include: { role: true },
          })
        : null;

      const operatorUser = platinumUser?.parentId
        ? await prisma.user.findUnique({
            where: { id: platinumUser.parentId },
            include: { role: true },
          })
        : null;

      const betAmount = Number(txn.betAmount ?? 0);
      const payoutAmount = Number(txn.payoutAmount ?? 0);
      const deposit = Number(txn.depositAmount ?? 0);
      const withdrawal = Number(txn.withdrawAmount ?? 0);
      const netGGR = betAmount - payoutAmount;

      const hierarchyUsers = [goldUser, platinumUser, operatorUser].filter(
        Boolean
      ) as (typeof goldUser)[];

      for (const user of hierarchyUsers) {
        if (!user?.role) continue;

        const userId = user.id;
        const roleId = user.role.id;

        const commissionRecord = await prisma.commission.findUnique({
          where: {
            siteId_userId_roleId_categoryId: {
              siteId: txn.siteId,
              userId,
              roleId,
              categoryId,
            },
          },
        });

        if (!commissionRecord) continue;

        const commissionPercentage = commissionRecord.commissionPercentage;
        const commissionAmount = (betAmount * commissionPercentage) / 100;

        const key = `${userId}-${roleId}-${categoryId}`;

        const existing = summaryMap.get(key) ?? {
          userId,
          roleId,
          categoryId,
          totalDeposit: 0,
          totalWithdrawals: 0,
          totalBetAmount: 0,
          netGGR: 0,
          grossCommission: 0,
          netCommissionAvailablePayout: 0,
        };

        existing.totalDeposit += deposit;
        existing.totalWithdrawals += withdrawal;
        existing.totalBetAmount += betAmount;
        existing.netGGR += netGGR;
        existing.grossCommission += commissionAmount;
        existing.netCommissionAvailablePayout += commissionAmount;

        summaryMap.set(key, existing);
      }
    }

    for (const summary of summaryMap.values()) {
      await prisma.commissionSummary.create({
        data: {
          userId: summary.userId,
          roleId: summary.roleId,
          categoryId: summary.categoryId,
          totalDeposit: summary.totalDeposit,
          totalWithdrawals: summary.totalWithdrawals,
          totalBetAmount: summary.totalBetAmount,
          netGGR: summary.netGGR,
          grossCommission: summary.grossCommission,
          paymentGatewayFee: 0,
          netCommissionAvailablePayout: summary.netCommissionAvailablePayout,
        },
      });
    }

    console.log("Commission summaries generated successfully.");
  }
}

export { GenerateCommission };
