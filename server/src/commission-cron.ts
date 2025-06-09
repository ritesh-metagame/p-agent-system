import {prisma} from "./server";
import {Decimal} from "./../prisma/generated/prisma/runtime/library";
import {format} from "date-fns";
import {CommissionService} from "./services/commission.service";
import getLogger from "./common/logger";
import cron from "node-cron";
import {DateTime} from "luxon";

const commissionService = new CommissionService();

const IGNORE_BEFORE_DATE = new Date("2025-05-26T00:00:00.000Z");
const META_ID = "commission-meta";

const logger = getLogger(module)

async function getLastProcessedDate(): Promise<Date | null> {
    const meta = await prisma.commissionProcessMeta.findUnique({
        where: {id: META_ID},
    });
    return meta?.lastProcessedAt ?? null;
}

async function setLastProcessedDate(date: Date) {
    await prisma.commissionProcessMeta.upsert({
        where: {id: META_ID},
        update: {lastProcessedAt: date},
        create: {
            id: META_ID,
            lastProcessedAt: date,
        },
    });
}

async function getEarliestBetAfter(date: Date): Promise<Date | null> {
    const result: { time_of_bet: Date }[] = await prisma.$queryRawUnsafe(`
        SELECT time_of_bet
        FROM bets
        WHERE time_of_bet >= '${date.toISOString()}'
        ORDER BY time_of_bet ASC LIMIT 1
    `);

    return result.length > 0 ? result[0].time_of_bet : null;
}

async function getBetsBetween(start: Date, end: Date): Promise<any[]> {
    const result: any[] = await prisma.$queryRawUnsafe(`
        SELECT *
        FROM bets
        WHERE time_of_bet BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
    `);

    return result;
}

export async function runCommissionCron() {
    logger.info("Starting commission cron...");
    const lastProcessed = await getLastProcessedDate();
    // logger.info("Last processed date:", lastProcessed?.toISOString());

    if (!lastProcessed) {
        const firstBetTime = await getEarliestBetAfter(IGNORE_BEFORE_DATE);
        // logger.info("First bet time:", firstBetTime?.toISOString());
        if (!firstBetTime) {
            // logger.silly("No bets found after 30 May. Skipping processing.");
            return;
        }

        const endTime = new Date();
        await processCommissionBetween(firstBetTime, endTime);
        await setLastProcessedDate(endTime);
    } else {
        const startTime = lastProcessed;
        const endTime = new Date();
        await processCommissionBetween(startTime, endTime);
        await setLastProcessedDate(endTime);
    }

    logger.info("Commission cron completed successfully.");
}

const categoryIdMap: Record<string, string> = {
    egames: "8a2ac3c1-202d-11f0-81af-0a951197db91",
    sportsbet: "8a2ac69c-202d-11f0-81af-0a951197db91",
};

async function processCommissionBetween(start: Date, end: Date) {
    const rawRows = await getBetsBetween(start, end);
    // logger.info(`Processing bets between ${start.toISOString()} and ${end.toISOString()} with ${rawRows.length} rows`);

    const involvedDates = new Set<string>(); // collect unique dates in UTC

    if (rawRows.length === 0) {
        // logger.info(`No bets between ${start.toISOString()} and ${end.toISOString()}`);
        return;
    }

    let totalRecord = 0;

    for (const row of rawRows) {

        // logger.info(`Processing transaction for time: ${row["time_of_bet"]}`);
        const platformType = row["platform_name"];
        const normalizedPlatform =
            platformType === "egames"
                ? "E-Games"
                : platformType === "sports" || platformType === "sportsbet"
                    ? "Sports Betting"
                    : platformType;

        const categoryId = categoryIdMap[platformType];
        const refundAmount = new Decimal(row["refund_amount"] || 0);

        const betAmount = new Decimal(row["bet_amount"] || 0);
        const payoutAmount = new Decimal(row["payout_amount"] || 0);

        const revenue = betAmount.minus(payoutAmount);


        const baseAmount = new Decimal(
            platformType === "egames"
                ? revenue || 0
                : platformType === "sports" || platformType === "sportsbet"
                    ? betAmount.minus(refundAmount)
                    : betAmount
        );

        // Step 1: GA
        const gaId = row["agent_code"];
        // const gaId = GAIDS.includes(excelGaId) ? excelGaId : null;

        if (!gaId) {
            //   logger.warn(`
            //   GA ID ${gaId} not found. Skipping transaction.
            // `);
            continue;
        }
        const gaCommissionRecord = await prisma.commission.findFirst({
            where: {
                userId: gaId,
                categoryId,
            },
        });


        const gaPercentage = new Decimal(
            gaCommissionRecord?.commissionPercentage || 0
        );
        const gaCommission = baseAmount.mul(gaPercentage).div(100);

        // Step 2: MA
        const gaUser = await prisma.user.findUnique({where: {id: gaId}});
        // logger.info(`Commission fetch: user=${gaId}, categoryId=${categoryId}, commissionRecord=${gaUser?.username || null}`);

        if (!gaUser) {
            // logger.warn(`GA user ${gaId} not found. Skipping transaction.`);
            continue;
        }

        const maId = gaUser?.parentId || null;

        const maName = await prisma.user.findFirst({
            where: {
                id: maId,
            },
        });

        let maPercentage = new Decimal(0);
        let maCommission = new Decimal(0);
        if (maId) {
            const maCommissionRecord = await prisma.commission.findFirst({
                where: {
                    userId: maId,
                    categoryId,
                },
            });


            maPercentage = new Decimal(
                maCommissionRecord?.commissionPercentage || 0
            );
            maCommission = baseAmount.mul(maPercentage).div(100);
        }

        let ownerName: string;

        // Step 3: Owner
        let ownerId = null;
        let ownerPercentage = new Decimal(0);
        let ownerCommission = new Decimal(0);

        if (maId) {
            const maUser = await prisma.user.findUnique({where: {id: maId}});
            ownerId = maUser?.parentId || null;

            const ownerUser = await prisma.user.findFirst({
                where: {
                    id: ownerId,
                },
            });
            ownerName = ownerUser?.username || null;

            if (ownerId) {
                const ownerCommissionRecord = await prisma.commission.findFirst({
                    where: {
                        userId: ownerId,
                        categoryId,
                    },
                });

                ownerPercentage = new Decimal(
                    ownerCommissionRecord?.commissionPercentage || 0
                );
                ownerCommission = baseAmount.mul(ownerPercentage).div(100);
            }
        }

        const betDateUtc = format(new Date(row["time_of_bet"]), "yyyy-MM-dd");
        involvedDates.add(betDateUtc); // collect the date

        // Step 4: Build transaction object
        const transaction = {
            transactionId: String(row["transaction_id"]),
            betTime: row["time_of_bet"],
            userId: row["User Id"],
            playerName: row["player_id"],
            platformType: normalizedPlatform,
            transactionType: row["transaction_type"],

            deposit: new Decimal(row["deposit_amount"] || 0),
            withdrawal: new Decimal(row["withdraw_amount"] || 0),
            betAmount: new Decimal(row["bet_amount"] || 0),
            payoutAmount: new Decimal(row["payout_amount"] || 0),
            refundAmount: new Decimal(row["refund_amount"] || 0),
            revenue: revenue,
            pgFeeCommission: new Decimal(row["pg_fee_commission"] || 0),

            status: row["status"] || null,
            settled: "N",

            gaId,
            gaName: gaUser?.username || null,
            gaPercentage,
            gaCommission,

            maId,
            maName: maName?.username || null,
            maPercentage,
            maCommission,

            ownerId,
            ownerName: ownerName || null,
            ownerPercentage,
            ownerCommission,
        };

        try {
            // logger.info(`Inserting transaction for time: ${transaction.betTime}`);
            // await prisma.transaction.create({data: transaction});
            totalRecord++
        } catch (err) {
            console.error(
                "Error inserting transaction:",
                transaction.transactionId,
                err
            );
        }
    }

    console.log({totalRecord})

    // logger.info(`Collected ${involvedDates.size} unique dates for commission summaries`);
    for (const date of involvedDates) {
        // logger.info(`Processing commission summary for date: ${date}`);
        try {
            // logger.info(`🔄 Creating commission summary for date: ${date}`);
            // await commissionService.createCommissionCategory(date);
        } catch (err) {
            // logger.error(`❌ Error creating commission for date ${date}:`, err);
        }
    }

    logger.info("All transactions inserted successfully")
}

export function scheduleDailyCommissionJob() {
    const nowUTC = DateTime.now().setZone('UTC');
    let target = nowUTC.set({hour: 18, minute: 30, second: 0, millisecond: 0}); // 6:30 PM UTC = 12:00 AM IST

    const initialRunTime = nowUTC.plus({minutes: 2}).set({second: 0, millisecond: 0});

    // If 6:30 PM UTC has already passed today, schedule for tomorrow
    if (nowUTC > target) {
        target = target.plus({days: 1});
    }

    const delay = initialRunTime.toMillis() - nowUTC.toMillis();

    console.log(`⏳ First run scheduled after 2 minutes at ${initialRunTime.toFormat('yyyy-LL-dd HH:mm:ss')} UTC`);

    // console.log(`⏳ Scheduling daily cron to start at ${target.toFormat('yyyy-LL-dd HH:mm:ss')} UTC (12:00 AM IST)`);

    setTimeout(() => {
        logger.info(`✅ Running first cron job at ${DateTime.now().setZone('UTC').toFormat('yyyy-LL-dd HH:mm:ss')} UTC`);

        // Run the task once after 2 minutes
        runCommissionCron();

        // Set up the recurring daily job at 6:30 PM UTC = 12:00 AM IST
        cron.schedule('30 18 * * *', () => {
            logger.info(`🔁 Daily scheduled job started at ${DateTime.now().setZone('UTC').toFormat('yyyy-LL-dd HH:mm:ss')} UTC`);
            runCommissionCron();
        });
    }, delay);
}