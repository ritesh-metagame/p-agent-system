import "reflect-metadata"; // We need this in order to use @Decorators
import express, { Express } from "express";
import path from "path";
import logger from "./common/logger";
import config from "./common/config";
import AppLoader from "./common/loaders";
import cron from "node-cron";
import { PrismaClient, TransactionType } from "./../prisma/generated/prisma";
import "./main";
import { Decimal } from "../prisma/generated/prisma/runtime/library";
import fs from "fs";
import csv from "csv-parser"; // install with: npm install csv-parser
import { GenerateCommission } from "./daos/generateCommission";

const filePath = path.join(__dirname, "./data/data1.csv");
// import { redisService } from "./core/services/redis.service";
const generateCommission = new GenerateCommission();

const log = logger(module);
const prisma = new PrismaClient();

class Server {
  private app: Express;

  // private betAmountBucketOrderConfigDao: BetAmountBucketOrderConfigDao;

  constructor() {
    this.app = express();
    this.app.use(
      "/downloads",
      express.static(path.join(__dirname, "downloads"))
    );
  }

  private async start(): Promise<void> {
    const appLoader = new AppLoader(this.app);
    await appLoader.load();

    const DB_URL = config.mongo.URL?.replace(
      "<USERNAME>",
      config.mongo.user!
    ).replace("<PASSWORD>", config.mongo.pass!) as string;

    const siteIds = ["cm9cf98v90000v9y824jf7qo9"];
    const goldenAgentIds = ["cm9cfsmfn000kv9y87pyibbrn"];

    const getRandom = (arr: string[]) =>
      arr[Math.floor(Math.random() * arr.length)];

    const getRandomSettledStatus = () => (Math.random() < 0.5 ? "Y" : "N");

    // async function insertTransactionsFromCSV(filePath: string) {
    //   const transactions: any[] = [];

    //   return new Promise<void>((resolve, reject) => {
    //     fs.createReadStream(filePath)
    //       .pipe(csv({ separator: "\t" }))
    //       .on("data", (row) => {
    //         console.log("Row:", row);
    //         // Construct the transaction object, map/parse types as needed
    //         const transaction = {
    //           id: row.id,
    //           betAmount: row.bet_amount || null,
    //           betId: row.bet_id,
    //           brand: row.brand || null,
    //           channelType: row.channel_type || null,
    //           gameId: row.game_id || null,
    //           gameName: row.game_name || null,
    //           gameProvider: row.game_provider || null,
    //           gameStatusId: row.game_status_id || null,
    //           gameType: row.game_type || null,
    //           jackpotContribution: row.jackpot_contribution || null,
    //           jackpotDetails: row.jackpot_details || null,
    //           jackpotPayout: row.jackpot_payout || null,
    //           jackpotType: row.jackpot_type || null,
    //           kioskTerminal: row.kiosk_terminal || null,
    //           machineId: row.machine_id || null,
    //           outletId: row.outlet_id || null,
    //           payoutAmount: row.payout_amount
    //             ? new Decimal(row.payout_amount)
    //             : null,
    //           platformCode: row.platform_code
    //             ? parseInt(row.platform_code)
    //             : null,
    //           platformName: row.platform_name || null,
    //           playerId: row.player_id || null,
    //           prematchLive: row.prematch_live || null,
    //           refundAmount: row.refund_amount
    //             ? new Decimal(row.refund_amount)
    //             : null,
    //           roundId: row.round_id || null,
    //           seedContriAmount: row.seed_contri_amount || null,
    //           settlementTime: row.settlement_time
    //             ? new Date(row.settlement_time)
    //             : null,
    //           siteId: getRandom(siteIds),
    //           sport: row.sport || null,
    //           status: row.status || null,
    //           ticketStatus: row.ticket_status || null,
    //           timeOfBet: row.time_of_bet ? new Date(row.time_of_bet) : null,
    //           timestamp: row.timestamp ? new Date(row.timestamp) : null,
    //           transactionId: row.transaction_id,
    //           transactionType: TransactionType.bet, // default as bet, override if needed
    //           depositAmount: new Decimal(0), // default to 0
    //           withdrawAmount: new Decimal(0), // default to 0
    //           depositCommission: new Decimal(0),
    //           withdrawCommission: new Decimal(0),
    //           settled: getRandomSettledStatus(),
    //           agentGoldenId: getRandom(goldenAgentIds),
    //         };
    //         console.log("Transaction:", transaction);

    //         transactions.push(transaction);
    //       })
    //       .on("end", async () => {
    //         try {
    //           for (const tx of transactions) {
    //             await prisma.transaction.create({
    //               data: tx,
    //             });
    //           }
    //           console.log("✅ All transactions inserted successfully");
    //           resolve();
    //         } catch (err) {
    //           console.error("❌ Error inserting transactions:", err);
    //           reject(err);
    //         }
    //       });
    //   });
    // }

    // insertTransactionsFromCSV(filePath)
    //   .then(() => {
    //     console.log("Import complete.");
    //   })
    //   .catch((err) => {
    //     console.error("Import failed:", err);
    //   });

    this.app
      .listen(config.port, () => {
        log.info(`
${process.env.NODE_ENV} Platform is running at http://localhost:${config.port} 🛡️
      `);
      })
      .on("error", (err) => {
        console.log(err);
        log.error(err);
        process.exit(1);
      });

    // code for run crone according to philippines time zone
    // cron.schedule(
    //   "59 59 23 * * *", // 11:59:59 PM every day
    //   async () => {
    //     try {
    //       const datePH = moment().tz("Asia/Manila").format("YYYY-MM-DD");
    //       console.log(`🔁 Generating commission summaries for ${datePH} (Asia/Manila)...`);
    //       await generateCommission.generateCommissionSummaries(datePH);
    //       console.log("✅ Commission summaries generated successfully.");
    //     } catch (error) {
    //       console.error("❌ Failed to generate commission summaries:", error);
    //     }
    //   },
    //   {
    //     timezone: "Asia/Manila",
    //   }
    // );

    // ⏰ Schedule daily commission summary generation
    cron.schedule("59 59 23 * * *", async () => {
      try {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0]; // 'YYYY-MM-DD'
        console.log(
          `🔁 Running commission summary generation for ${formattedDate}...`
        );
        await generateCommission.generateCommissionSummaries(formattedDate);
        console.log("✅ Commission summaries generated successfully.");
      } catch (error) {
        console.error("❌ Failed to generate commission summaries:", error);
      }
    });
  }

  public async initialize(): Promise<void> {
    try {
      await this.start();
    } catch (error) {
      console.log({ error });
      log.error("Error starting server:", error);
      process.exit(1);
    }
  }
}

const server = new Server();

server.initialize();

export { prisma };
