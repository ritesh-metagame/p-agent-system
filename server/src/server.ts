import "reflect-metadata"; // We need this in order to use @Decorators
import express, {Express} from "express";
import path from "path";
import logger from "./common/logger";
import config from "./common/config";
import AppLoader from "./common/loaders";

import cron from "node-cron";

import {PrismaClient} from "./../prisma/generated/prisma";
import "./main";
import {scheduleDailyCommissionJob} from "./commission-cron";

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

    public async initialize(): Promise<void> {
        try {
            await this.start();
        } catch (error) {
            console.log({error});
            log.error("Error starting server:", error);
            process.exit(1);
        }
    }

    private async start(): Promise<void> {
        const appLoader = new AppLoader(this.app);
        await appLoader.load();

        scheduleDailyCommissionJob();

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
}

const server = new Server();

server.initialize();

export {prisma};
