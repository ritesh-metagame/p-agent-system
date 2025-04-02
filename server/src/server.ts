import "reflect-metadata"; // We need this in order to use @Decorators
import express, { Express } from "express";
import path from "path";
import logger from "./common/logger";
import config from "./common/config";
import AppLoader from "./common/loaders";

import { PrismaClient } from "../generated/prisma";

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
