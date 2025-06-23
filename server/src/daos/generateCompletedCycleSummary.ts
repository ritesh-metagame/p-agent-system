import {prisma} from "../server";
import {startOfDay, endOfDay} from "date-fns";
import {UserRole} from "../common/config/constants";
import {moveJobFromActiveToWait} from "bullmq/dist/esm/scripts";

interface SummData {
    netGGR: number;
    netCommissionAvailablePayout: number;
    totalBetAmount: number;
    parentCommission?: number;
}

class GenerateCompletedCycleCommission {
    public async completeCycle(
        cycleStart: Date,
        cycleEnd: Date,
        categoryName: string
    ) {
        const isGGRCategory = [
            'E-Games',
            'Speciality Games - RNG'
        ].includes(categoryName);

        // 1. load GOLDEN and PLATINUM users for parent mapping
        const [goldens, platinums] = await Promise.all([
            prisma.user.findMany({
                where: {role: {name: UserRole.GOLDEN}},
                select: {id: true, parentId: true}
            }),
            prisma.user.findMany({
                where: {role: {name: UserRole.PLATINUM}},
                select: {id: true, parentId: true}
            })
        ]);

        const goldenIds = goldens.map(g => g.id);
        const goldToPlat = new Map<string, string | null>(goldens.map(g => [g.id, g.parentId]));
        const platToOp = new Map<string, string | null>(platinums.map(p => [p.id, p.parentId]));

        // helper zero-init
        const zero: SummData = {
            netGGR: 0,
            netCommissionAvailablePayout: 0,
            totalBetAmount: 0,
            parentCommission: 0
        };

        // 2. fetch only GOLDEN summaries in range & category
        const raw = await prisma.commissionSummary.findMany({
            where: {
                userId: {in: goldenIds},
                categoryName,
                createdAt: {gte: cycleStart, lte: cycleEnd}
            },
            select: {
                userId: true,
                netGGR: true,
                parentCommission: true,
                netCommissionAvailablePayout: true,
                totalBetAmount: true,
                pendingSettleCommission: true,
                settledByOperator: true,
                settledByPlatinum: true,
                settledBySuperadmin: true
            }
        });

        // 3. aggregate by GOLDEN (sum raw values, including negatives)
        const goldenAgg = new Map<string, SummData>();
        for (const doc of raw) {
            const cur = goldenAgg.get(doc.userId) ?? {...zero};
            goldenAgg.set(doc.userId, {
                netGGR: cur.netGGR + doc.netGGR,
                netCommissionAvailablePayout: cur.netCommissionAvailablePayout + doc.netCommissionAvailablePayout,
                totalBetAmount: cur.totalBetAmount + doc.totalBetAmount,
            });
        }

        // 4. roll up GOLDEN -> PLATINUM roll up GOLDEN -> PLATINUM
        const platinumAgg = new Map<string, SummData>();
        for (const [goldId, sum] of goldenAgg.entries()) {
            const parentPlat = goldToPlat.get(goldId);
            if (!parentPlat) continue;
            const cur = platinumAgg.get(parentPlat) ?? {...zero};
            platinumAgg.set(parentPlat, {
                netGGR: cur.netGGR + sum.netGGR,
                netCommissionAvailablePayout: cur.netCommissionAvailablePayout + sum.netCommissionAvailablePayout,
                totalBetAmount: cur.totalBetAmount + sum.totalBetAmount,
            });
        }

        // 5. roll up PLATINUM -> OPERATOR
        const operatorAgg = new Map<string, SummData>();
        for (const [platId, sum] of platinumAgg.entries()) {
            const parentOp = platToOp.get(platId);
            if (!parentOp) continue;
            const cur = operatorAgg.get(parentOp) ?? {...zero};
            console.log({sum, parentOp, platId})
            operatorAgg.set(parentOp, {
                netGGR: cur.netGGR + Math.max(0, sum.netGGR), // clamp to zero
                netCommissionAvailablePayout: cur.netCommissionAvailablePayout + sum.netCommissionAvailablePayout,
                totalBetAmount: cur.totalBetAmount + sum.totalBetAmount,
            });
        }

        const rows: Array<any> = [];

        // GOLDEN-level
        for (const [userId, sums] of goldenAgg.entries()) {
            const {commissionPercentage} = await prisma.commission.findFirst({
                where: {userId, category: {name: categoryName}},
                select: {commissionPercentage: true}
            })!;

            const parent = goldToPlat.get(userId);

            const {commissionPercentage: parentCommissionPercentage} = await prisma.commission.findFirst({
                where: {userId: parent || "", category: {name: categoryName}},
                select: {commissionPercentage: true}
            });

            const baseValue = isGGRCategory
                ? Math.max(0, sums.netGGR)
                : sums.totalBetAmount;

            console.log(`Commission for ${userId} in ${categoryName}: ${commissionPercentage}% which makes the net payout ${baseValue * commissionPercentage / 100}`);

            rows.push({
                userId,
                categoryName,
                cycleStart,
                cycleEnd,
                netGGR: Math.max(0, sums.netGGR),
                netCommissionAvailablePayout: baseValue * commissionPercentage / 100,
                totalBetAmount: sums.totalBetAmount,
                pendingSettleCommission: 0,
                parentCommission: baseValue * parentCommissionPercentage / 100,
                settledByOperator: false,
                settledByPlatinum: false,
                settledBySuperadmin: false
            });
        }

        // PLATINUM-level
        for (const [userId, sums] of platinumAgg.entries()) {
            const {commissionPercentage} = await prisma.commission.findFirst({
                where: {userId, category: {name: categoryName}},
                select: {commissionPercentage: true}
            })!;

            const parent = platToOp.get(userId);

            const {commissionPercentage: parentCommissionPercentage} = await prisma.commission.findFirst({
                where: {userId: parent || "", category: {name: categoryName}},
                select: {commissionPercentage: true}
            });

            const baseValue = isGGRCategory
                ? Math.max(0, sums.netGGR)
                : sums.totalBetAmount;

            console.log(`Commission for ${userId} in ${categoryName}: ${commissionPercentage}% which makes the net payout ${baseValue * commissionPercentage / 100}`);

            rows.push({
                userId,
                categoryName,
                cycleStart,
                cycleEnd,
                netGGR: Math.max(0, sums.netGGR),
                netCommissionAvailablePayout: baseValue * commissionPercentage / 100,
                totalBetAmount: sums.totalBetAmount,
                parentCommission: baseValue * parentCommissionPercentage / 100,
                pendingSettleCommission: 0,
                settledByOperator: false,
                settledByPlatinum: false,
                settledBySuperadmin: false
            });
        }

        // OPERATOR-level
        for (const [userId, sums] of operatorAgg.entries()) {
            const {commissionPercentage} = await prisma.commission.findFirst({
                where: {userId, category: {name: categoryName}},
                select: {commissionPercentage: true}
            })!;

            const baseValue = isGGRCategory
                ? Math.max(0, sums.netGGR)
                : sums.totalBetAmount;

            console.log(`Commission for ${userId} in ${categoryName}: ${commissionPercentage}% which makes the net payout ${baseValue * commissionPercentage / 100}`);

            rows.push({
                userId,
                categoryName,
                cycleStart,
                cycleEnd,
                netGGR: Math.max(0, sums.netGGR),
                netCommissionAvailablePayout: baseValue * commissionPercentage / 100,
                totalBetAmount: sums.totalBetAmount,
                pendingSettleCommission: 0,
                parentCommission: 0, // no parent for operator
                settledByOperator: false,
                settledByPlatinum: false,
                settledBySuperadmin: false
            });
        }

        // return;

        await prisma.completedCycleSummaries.createMany({data: rows});
    }
}

export {GenerateCompletedCycleCommission};
