import { TransactionType } from "../prisma/generated/prisma";
import { Decimal } from "../prisma/generated/prisma/runtime/library";
import { prisma } from "./server";
// import { TransactionType } from "../prisma/generated/prisma";
// import { Decimal } from "../prisma/generated/prisma/runtime/library";

async function seedTransactions() {
  try {
    // First, ensure we have a site
    let site = await prisma.site.findFirst();

    if (!site) {
      site = await prisma.site.create({
        data: {
          name: "Default Site",
          url: "https://default-site.com",
          description: "Default site for testing",
        },
      });
    }

    const transactions = Array.from({ length: 30 }, (_, i) => ({
      betId: `BET${i + 1}`,
      transactionId: `TXN${i + 1}`,
      siteId: site.id, // Required field
      depositAmount: new Decimal(Math.random() * 100),
      withdrawAmount: new Decimal(Math.random() * 50),
      betAmount: new Decimal(Math.random() * 200),
      payoutAmount: new Decimal(Math.random() * 150),
      refundAmount: new Decimal(Math.random() * 20),
      transactionType: TransactionType.bet,
      status: "completed",
      settled: "Y",
      playerName: `Player ${i + 1}`,
      gameName: `Game ${i + 1}`,
      gameProvider: "Provider " + Math.floor(i / 5),
      timeOfBet: new Date(),
      settlementTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await prisma.transaction.createMany({
      data: transactions,
    });

    console.log("30 transactions have been seeded successfully.");
  } catch (error) {
    console.error("Error seeding transactions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTransactions();
