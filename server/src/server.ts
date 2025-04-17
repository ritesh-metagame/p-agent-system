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

const filePath = path.join(__dirname, "./data/sampledata.xlsx");
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

    const siteIds = ["cm9jkon7w0001v9g86q7jdvc7"];
    const GAIDS = ["cm9ljw2ad001yv96gwdkch2mn"];
    const MAIDS = [
      "cm9jvlj0g001sjf8g6b84k34b",
      "cm9jvknlf001ijf8grhz4covw",
      "cm9jvjkdn0018jf8g3p3gknz3",
    ];
    const OWNERIDS = ["cm9jvi2ct000ijf8gjrzikjpo", "cm9jvf4t20004jf8g24j83ytf"];

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

    async function insertTransactionsFromXLSX(filePath: string) {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows = xlsx.utils.sheet_to_json(sheet);

      for (const rawRow of rawRows) {
        const row = cleanRowKeys(rawRow);
        const platformType = row["Platform Type"];
        const baseAmount = new Decimal(
          platformType === "egames"
            ? row["Revenue"] || 0
            : row["Bet Amount"] || 0
        );

        // Step 1: GA
        const gaId = getRandom(GAIDS);
        const gaCommissionRecord = await prisma.commission.findFirst({
          where: { userId: gaId },
        });
        const gaPercentage = new Decimal(
          gaCommissionRecord?.commissionPercentage || 0
        );
        const gaCommission = baseAmount.mul(gaPercentage).div(100);

        // Step 2: MA (Parent of GA)
        const gaUser = await prisma.user.findUnique({ where: { id: gaId } });
        const maId = gaUser?.parentId || null;

        let maPercentage = new Decimal(0);
        let maCommission = new Decimal(0);
        if (maId) {
          const maCommissionRecord = await prisma.commission.findFirst({
            where: { userId: maId },
          });

          maPercentage = new Decimal(
            maCommissionRecord?.commissionPercentage || 0
          );
          maCommission = baseAmount.mul(maPercentage).div(100);
        }

        // Step 3: Owner (Parent of MA)
        let ownerId = null;
        let ownerPercentage = new Decimal(0);
        let ownerCommission = new Decimal(0);

        if (maId) {
          const maUser = await prisma.user.findUnique({ where: { id: maId } });
          ownerId = maUser?.parentId || null;

          if (ownerId) {
            const ownerCommissionRecord = await prisma.commission.findFirst({
              where: { userId: ownerId },
            });

            ownerPercentage = new Decimal(
              ownerCommissionRecord?.commissionPercentage || 0
            );
            ownerCommission = baseAmount.mul(ownerPercentage).div(100);
          }
        }

        // Step 4: Build transaction object
        const transaction = {
          transactionId: String(row["Trans ID"]),
          betTime: parseExcelDate(row["Bet Time"]),
          userId: row["User Id"],
          playerName: row["Player Name"],
          platformType,
          transactionType: row["Transaction Type"] || "bet",

          deposit: new Decimal(row["Deposit"] || 0),
          withdrawal: new Decimal(row["Withdraw"] || 0),
          betAmount: new Decimal(row["Bet Amount"] || 0),
          payoutAmount: new Decimal(row["Payout Amount"] || 0),
          refundAmount: new Decimal(row["Refund Amount"] || 0),
          revenue: new Decimal(row["Revenue"] || 0),
          pgFeeCommission: new Decimal(row["PG Fee Commission"] || 0),

          status: row["Status"] || null,
          settled: getRandomSettledStatus(),

          gaId,
          gaName: row["GA Name"] || null,
          gaPercentage,
          gaCommission,

          maId,
          maName: row["MA Name"] || null,
          maPercentage,
          maCommission,

          ownerId,
          ownerName: row["Owner Name"] || null,
          ownerPercentage,
          ownerCommission,
        };

        try {
          await prisma.transaction.create({ data: transaction });
        } catch (err) {
          console.error(
            "❌ Error inserting transaction:",
            transaction.transactionId,
            err
          );
        }

        console.log("✅ All transactions inserted successfully");
      }
    }

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
${process.env.NODE_ENV} Platform is running at http://localhost:${config.port} 🛡️
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
