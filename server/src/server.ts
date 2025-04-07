import "reflect-metadata"; // We need this in order to use @Decorators
import express, { Express } from "express";
import path from "path";
import logger from "./common/logger";
import config from "./common/config";
import AppLoader from "./common/loaders";

import { PrismaClient, TransactionType } from "./../prisma/generated/prisma";
import "./main";
import { Decimal } from "../prisma/generated/prisma/runtime/library";

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

    // const conn = await connect(DB_URL, config.mongo.dbName!);
    // log.info(`Platform db is running on host ${conn?.connection.host}`);

    const goldenAgentIds = [
      "cm96y9psv004rjf9wyib6e4y5",
      "cm96yaff00055jjf9wfd2iufyu",
      "cm96yb9xv005jjf9w5yqyfnpv",
      "cm96ybs86805xjf9wa9m7zbxx",
      "cm96ycsgb006bjf9wtvbk7avg",
      "cm96ydc7g006pjf9wmsksay3x",
      "cm96ye7ut0073jf9w2zxra1ev",
      "cm96yepy0007hjf9wh0qujc51",
    ];

    const siteIds = [
      "cm96xwhib0000jf9wsm3rswf4",
      "cm96xx4200001jf9wau9kql32",
      "cm96xxmms0002jf9wkyh2c5qq",
      "cm96xy6u40003jf9wimurv6as",
    ];

    const getRandomSiteId = () =>
      siteIds[Math.floor(Math.random() * siteIds.length)];
    const getRandomDecimal = () =>
      new Decimal((Math.random() * 1000).toFixed(2));

    async function insertTransactions() {
      const transactions = [];

      for (const agentGoldenId of goldenAgentIds) {
        for (let i = 0; i < 5; i++) {
          transactions.push(
            prisma.transaction.create({
              data: {
                betId: `BID-${Math.random().toString(36).substring(2, 10)}`,
                transactionId: `TXN-${Math.random().toString(36).substring(2, 10)}`,
                agentGoldenId,
                // site
                siteId: getRandomSiteId(),
                betAmount: getRandomDecimal(),
                payoutAmount: getRandomDecimal(),
                depositAmount: new Decimal(0),
                withdrawAmount: new Decimal(0),
                transactionType: TransactionType.bet,
                settled: "N",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            })
          );
        }
      }

      await Promise.all(transactions);
      console.log("Transactions inserted successfully.");
    }

    insertTransactions()
      .catch((e) => console.error(e))
      .finally(() => prisma.$disconnect());

    // redisService.connect();

    // const { server } = this.socketService;

    // await this.connectRedisClient();

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
