import { connect as mongooseConnect } from "mongoose";
import logger from "./../logger";
import { PrismaClient as PrismaClientBase } from "@prisma/client";

const log = logger(module);

class PrismaClient {
  client: PrismaClientBase;

  constructor() {
    this.client = new PrismaClientBase();
  }

  getClient(): PrismaClientBase {
    return this.client;
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}

export { PrismaClient, PrismaClientBase };
