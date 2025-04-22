import { Response } from "../common/config/response";
import { ResponseCodes } from "../common/config/responseCodes";
import { TransactionDao } from "../daos/transaction.dao";
import { isValid, parse } from "date-fns";
import {
  getTransactionReportDateRanges,
  generateCsvDownloadPath,
  getTransactionReportDateRangesWithFiltering,
} from "../common/lib/date-utils";
import { Service } from "typedi";

@Service()
class TransactionService {
  private transactionDao: TransactionDao;

  constructor() {
    this.transactionDao = new TransactionDao();
  }

  /**
   * Get transaction report data for display in the UI table
   * If no date range is provided, returns periods from earliest to latest transaction
   * that actually have data
   * If date range is provided but no data exists in that range, returns empty array
   */
  public async getTransactionReports(
    startDateStr?: string,
    endDateStr?: string
  ) {
    try {
      // When custom date range is provided, check if there's data in that range
      if (startDateStr && endDateStr) {
        const startDate = parse(startDateStr, "yyyy-MM-dd", new Date());
        const endDate = parse(endDateStr, "yyyy-MM-dd", new Date());

        if (!isValid(startDate) || !isValid(endDate)) {
          throw new Error("Invalid date format. Use YYYY-MM-DD");
        }

        if (startDate > endDate) {
          throw new Error("Start date must be before or equal to end date");
        }

        // Check if there's any data in this range
        const hasData = await this.transactionDao.hasTransactionsInPeriod(
          startDate,
          endDate
        );

        // If no data in the specified range, return empty array
        if (!hasData) {
          return new Response(
            ResponseCodes.TRANSACTION_FETCHED_SUCCESSFULLY.code,
            ResponseCodes.TRANSACTION_FETCHED_SUCCESSFULLY.message,
            []
          );
        }
      }

      // When no custom range is provided, get earliest and latest transaction dates
      let earliestDate = null;
      let latestDate = null;

      if (!startDateStr || !endDateStr) {
        earliestDate = await this.transactionDao.getEarliestTransactionDate();
        latestDate = await this.transactionDao.getLatestTransactionDate();

        if (!earliestDate || !latestDate) {
          return new Response(
            ResponseCodes.TRANSACTION_FETCHED_SUCCESSFULLY.code,
            ResponseCodes.TRANSACTION_FETCHED_SUCCESSFULLY.message,
            []
          );
        }
      }

      // Get date ranges with filtering (only periods that have transactions)
      const dateRanges = await getTransactionReportDateRangesWithFiltering(
        startDateStr,
        endDateStr,
        earliestDate,
        latestDate,
        async (startDate, endDate) => {
          return this.transactionDao.hasTransactionsInPeriod(
            startDate,
            endDate
          );
        }
      );

      // Map each date range to a table row
      const reportData = dateRanges.map((range) => ({
        id: range.id,
        fromDate: range.fromDateFormatted,
        toDate: range.toDateFormatted,
        status: "COMPLETED",
        download: generateCsvDownloadPath(range.startDate, range.endDate),
      }));

      return new Response(
        ResponseCodes.TRANSACTION_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.TRANSACTION_FETCHED_SUCCESSFULLY.message,
        reportData
      );
    } catch (error) {
      return new Response(
        ResponseCodes.SOMETHING_WENT_WRONG.code,
        `Error fetching transaction reports: ${error.message}`,
        null
      );
    }
  }

  /**
   * Get transactions for specific date range and return in specified format
   */
  public async getTransactionData(startDateStr: string, endDateStr: string) {
    try {
      // Parse and validate dates
      const startDate = parse(startDateStr, "yyyy-MM-dd", new Date());
      const endDate = parse(endDateStr, "yyyy-MM-dd", new Date());

      if (!isValid(startDate) || !isValid(endDate)) {
        throw new Error("Invalid date format. Use YYYY-MM-DD");
      }

      if (startDate > endDate) {
        throw new Error("Start date must be before or equal to end date");
      }

      // Get transactions between the specified dates
      const result = await this.transactionDao.getTransactionsBetweenDates(
        startDate,
        endDate
      );

      return new Response(
        ResponseCodes.TRANSACTION_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.TRANSACTION_FETCHED_SUCCESSFULLY.message,
        {
          totalRecords: result.totalRecords,
          csvContent: result.csvContent,
        }
      );
    } catch (error) {
      return new Response(
        ResponseCodes.SOMETHING_WENT_WRONG.code,
        `Error fetching transactions: ${error.message}`,
        null
      );
    }
  }
}

export { TransactionService };
