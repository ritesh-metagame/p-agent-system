import "reflect-metadata"; // We need this in order to use @Decorators
import express, { Express } from "express";
import path from "path";
import logger from "./common/logger";
import config from "./common/config";
import AppLoader from "./common/loaders";
import xlsx from "xlsx";

import { PrismaClient } from "./../prisma/generated/prisma";
import "./main";
import { Decimal } from "../prisma/generated/prisma/runtime/library";
import fs from "fs";
import csv from "csv-parser"; // install with: npm install csv-parser
import { exportBetsWithAgentCodeToExcel } from "./common/config/db.config";

const filePath = path.join(__dirname, "./data/bets_with_agent_code.xlsx");
// import { redisService } from "./core/services/redis.service";

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

    const siteIds = [
      "cm9cjqylv0002iob9krq51nvo",
      "cm9cjrg5t0003iob9otfnpn8n",
      "cm9cmuwr6000oiol5ob3lmprc",
      "cm9cqlj9w000piol52m087niu",
    ];
    // const GAIDS = ["cmakq6t0d001uv9aog3bq171j"];
    const GAIDS = ["cmaywjc7100fdioys47zdd6sa"];
    
    const MAIDS = [
      "cm9cjv0qc0013iob901spod6b",
      "cm9cjvrs6001hiob9jccmjs6p",
      "cm9cjwpmu0021iob9mantjcze",
      "cm9cjxf2k002liob9184yl4h2",
      "cm9cjy80z002ziob9d34nt51k",
      "cm9i42r9l001qioxnto68zgkx",
      "cm9ih2pip0001iovt3frdptyu",
      "cm9ih93do000yiovt9tkdwjl3",
    ];
    const OWNERIDS = [
      "cm9cjseyd0005iob9kv4hj608",
      "cm9cjta0j000fiob9guy5sgvm",
      "cm9cju1dr000piob90w4tt5q5",
      "cm9cqnl55000riol58vg52wda",
      "cm9i2urpd0001ioxnb1yd157w",
      "cm9i4sxti0037ioxnct6eeu0t",
    ];

    const getRandom = (arr: string[]) =>
      arr[Math.floor(Math.random() * arr.length)];

    const getRandomSettledStatus = () => (Math.random() < 0.5 ? "Y" : "N");

    function parseExcelDate(excelDate: number): Date | null {
      if (!excelDate || isNaN(excelDate)) return null;
      return new Date((excelDate - 25569) * 86400 * 1000);
    }

    function cleanRowKeys(row: Record<string, any>): Record<string, any> {
      const cleaned: Record<string, any> = {};
      for (const key in row) {
        cleaned[key.trim()] = row[key];
      }
      return cleaned;
    }

    const categoryIdMap: Record<string, string> = {
      egames: "8a2ac3c1-202d-11f0-81af-0a951197db91",
      sportsbet: "8a2ac69c-202d-11f0-81af-0a951197db91",
    };

    async function insertTransactionsFromXLSX(filePath: string) {
     
        const rawRows: any = await prisma.$queryRawUnsafe(`
  SELECT * FROM bets
  WHERE time_of_bet BETWEEN '2025-05-26 00:00:00' AND '2025-05-26 23:59:59'
`);

      
      // console.log("Raw rows---:", rawRows);


      for (const row of rawRows) {
                // console.log("Row data:", row);

        // const row = cleanRowKeys(rawRow);

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
          console.warn(`
            ⚠ GA ID ${gaId} not found in allowed GAIDS. Skipping transaction.
          `);
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
        const gaUser = await prisma.user.findUnique({ where: { id: gaId } });
                console.log(`Commission fetch: user=${gaId}, categoryId=${categoryId}, commissionRecord=${gaUser.username}`);

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

        let ownerName :string;

        // Step 3: Owner
        let ownerId = null;
        let ownerPercentage = new Decimal(0);
        let ownerCommission = new Decimal(0);

        if (maId) {
          const maUser = await prisma.user.findUnique({ where: { id: maId } });
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

        // Step 4: Build transaction object
        const transaction = {
          transactionId: String(row["transaction_id"]),
          betTime: row["time_of_bet"],
          userId: row["User Id"],
          playerName: row["player_id"],
          platformType: normalizedPlatform,
          transactionType: row["transaction_type"] ,

          deposit: new Decimal(row["deposit_amount"] || 0),
          withdrawal: new Decimal(row["withdraw_amount"] || 0),
          betAmount: new Decimal(row["bet_amount"] || 0),
          payoutAmount: new Decimal(row["payout_amount"] || 0),
          refundAmount: new Decimal(row["refund_amount"] || 0),
          revenue: revenue ,
          pgFeeCommission: new Decimal(row["pg_fee_commission"] || 0),

          status: row["status"] || null,
          settled: "N",

          gaId,
          gaName: gaUser.username || null,
          gaPercentage,
          gaCommission,

          maId,
          maName: maName.username || null,
          maPercentage,
          maCommission,

          ownerId,
          ownerName: ownerName || null,
          ownerPercentage,
          ownerCommission,
        };

        try {
          // console.log("Inserting transaction:", transaction.transactionId);
          await prisma.transaction.create({ data: transaction });
        } catch (err) {
          console.error(
            "❌ Error inserting transaction:",
            transaction.transactionId,
            err
          );
        }
      }

      console.log("✅ All transactions inserted successfully");
    }

    //  exportBetsWithAgentCodeToExcel();

    // insertTransactionsFromXLSX(filePath)
    //   .then(() => {
    //     console.log("Import complete.");
    //   })
    //   .catch((err) => {
    //     console.error("Import failed:", err);
    //   });

    this.app
      .listen(config.port, () => {
        log.info(`
${process.env.NODE_ENV} Platform is running at http://localhost:${config.port} 🛡
      `);
      })
      .on("error", (err) => {
        console.log(err);
        log.error(err);
        process.exit(1);
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
