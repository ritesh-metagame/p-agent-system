import { prisma } from "../server";
import { format } from "date-fns";
import * as fs from "fs";
import * as path from "path";

class TransactionDao {
  public async getTopPerformerSummary(type: "all_time" | "per_cutoff") {}

  /**
   * Get transactions between two dates and format them for table display or CSV download
   */
  public async getTransactionsBetweenDates(startDate: Date, endDate: Date) {

    console.log("---------------------------------start date---------------------------------------", {startDate, endDate})

    const endDateUpdated = new Date(endDate.setHours(23, 59, 59, 999))

    const transactions = await prisma.transaction.findMany({
      where: {
        betTime: {
          gte: startDate,
          lte: endDateUpdated, // Include the entire end date
        },
      },
      orderBy: {
        betTime: "asc",
      },
    });

    // Format the data as CSV
    const csvRows = transactions.map((t) =>
      [
        t.transactionId,
        t.betTime ? format(t.betTime, "dd-MM-yyyy") : "",
        t.userId || "",
        t.playerName || "",
        t.platformType || "",
        t.transactionType || "",
        t.deposit?.toString() || "0",
        t.withdrawal?.toString() || "0",
        t.betAmount?.toString() || "0",
        t.payoutAmount?.toString() || "0",
        t.refundAmount?.toString() || "0",
        t.revenue?.toString() || "0",
        t.pgFeeCommission?.toString() || "0",
        t.status || "",
        t.ownerId || "",
        t.ownerName || "",
        t.ownerPercentage?.toString() || "0",
        t.ownerCommission?.toString() || "0",
        t.maId || "",
        t.maName || "",
        t.maPercentage?.toString() || "0",
        t.maCommission?.toString() || "0",
        t.gaId || "",
        t.gaName || "",
        t.gaPercentage?.toString() || "0",
        t.gaCommission?.toString() || "0",
        t.settled || "N",
      ].join(",")
    );

    const headers = [
      "Trans ID",
      "Bet Time",
      "User Id",
      "Player Name",
      "Platform Type",
      "Transaction Type",
      "Deposit",
      "Withdraw",
      "Bet Amount",
      "Payout Amount",
      "Refund Amount",
      "Revenue",
      "PG Fee Commission",
      "Status",
      "Owner ID",
      "Owner Name",
      "Owner Percentage",
      "Owner Commission",
      "MA ID",
      "MA Name",
      "MA Percentage",
      "MA Commission",
      "GA ID",
      "GA Name",
      "GA Percentage",
      "GA Commission",
      "Settled",
    ].join(",");

    const csvContent = [headers, ...csvRows].join("\n");

    return {
      tableData: {
        id: 1,
        fromDate: startDate,
        endDate: endDate,
        status: "COMPLETED",
        action: "DOWNLOAD",
      },
      totalRecords: transactions.length,
      csvContent,
    };
  }

  /**
   * Get earliest transaction date in the system
   */
  public async getEarliestTransactionDate(): Promise<Date | null> {
    const result = await prisma.transaction.findFirst({
      orderBy: {
        betTime: "asc",
      },
      select: {
        betTime: true,
      },
    });

    return result?.betTime || null;
  }

  /**
   * Get latest transaction date in the system
   */
  public async getLatestTransactionDate(): Promise<Date | null> {
    const result = await prisma.transaction.findFirst({
      orderBy: {
        betTime: "desc",
      },
      select: {
        betTime: true,
      },
    });

    return result?.betTime || null;
  }

  /**
   * Check if there are any transactions in the given date range
   */
  public async hasTransactionsInPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    const count = await prisma.transaction.count({
      where: {
        betTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      take: 1, // We only need to know if there's at least one
    });

    return count > 0;
  }
}

export { TransactionDao };
