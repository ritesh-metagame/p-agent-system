import {
  CommissionComputationPeriod,
  DEFAULT_COMMISSION_COMPUTATION_PERIOD,
} from "../config/constants";
import {
  endOfMonth,
  format,
  parse,
  isValid,
  endOfDay,
  startOfMonth,
  getDate,
  getDaysInMonth,
} from "date-fns";

interface DateRange {
  startDate: Date;
  endDate: Date;
  fromDateFormatted: string;
  toDateFormatted: string;
  id: number;
}

/**
 * Gets transaction report date ranges based on computation period and actual transaction date range
 * If no explicit dates are provided, it returns periods from earliest to latest transaction
 * based on the current system computation period
 *
 * If custom date range is provided, it will return data for just that range
 *
 * Periods with no transactions will be filtered out
 */
export function getTransactionReportDateRanges(
  startDateStr?: string,
  endDateStr?: string,
  earliestTransactionDate?: Date,
  latestTransactionDate?: Date,
  hasTransactions?: (startDate: Date, endDate: Date) => Promise<boolean>,
  maxResults: number = 10
): DateRange[] {
  // If custom date range is provided, return only that range
  if (startDateStr && endDateStr) {
    try {
      const startDate = parse(startDateStr, "yyyy-MM-dd", new Date());
      const endDate = parse(endDateStr, "yyyy-MM-dd", new Date());

      if (!isValid(startDate) || !isValid(endDate)) {
        throw new Error("Invalid date format");
      }

      if (startDate > endDate) {
        throw new Error("Start date must be before or equal to end date");
      }

      return [
        {
          id: 1,
          startDate,
          endDate,
          fromDateFormatted: format(startDate, "dd/MM/yyyy"),
          toDateFormatted: format(endDate, "dd/MM/yyyy"),
        },
      ];
    } catch (error) {
      console.error("Error parsing date range:", error);
      // If there's an error parsing dates, fall back to default behavior
    }
  }

  // If no transaction data available, return empty array
  if (!earliestTransactionDate || !latestTransactionDate) {
    return [];
  }

  // Generate periods based on actual transaction date range
  let periodStart = new Date(earliestTransactionDate);
  const periodEnd = new Date(latestTransactionDate);
  const ranges: DateRange[] = [];

  // Start with a high ID as in the screenshot examples
  let id = 0;

  // Function to check if period should be included
  // (can't use async hasTransactions directly inside array methods)
  const shouldIncludePeriod = () => true; // Initially include all periods

  // BI_MONTHLY logic
  if (
    DEFAULT_COMMISSION_COMPUTATION_PERIOD ===
    CommissionComputationPeriod.BI_MONTHLY
  ) {
    // Adjust earliestTransactionDate to either 1st or 16th of month
    const day = getDate(periodStart);
    if (day <= 15) {
      // Use 1st of month
      periodStart = startOfMonth(periodStart);
    } else {
      // Use 16th of month
      periodStart = new Date(
        periodStart.getFullYear(),
        periodStart.getMonth(),
        16
      );
    }

    // Calculate periods from start to end
    const periods: DateRange[] = [];
    let currentStart = new Date(periodStart);

    while (currentStart <= periodEnd) {
      const day = getDate(currentStart);
      let currentEnd: Date;

      if (day === 1) {
        // First half of month (1-15)
        currentEnd = new Date(
          currentStart.getFullYear(),
          currentStart.getMonth(),
          15,
          23,
          59,
          59
        );

        // Next period will start on the 16th
        const nextStart = new Date(
          currentStart.getFullYear(),
          currentStart.getMonth(),
          16
        );

        periods.push({
          id: ++id,
          startDate: new Date(currentStart),
          endDate: new Date(currentEnd),
          fromDateFormatted: format(currentStart, "dd/MM/yyyy"),
          toDateFormatted: format(currentEnd, "dd/MM/yyyy"),
        });

        currentStart = nextStart;
      } else {
        // Second half of month (16-end)
        currentEnd = endOfMonth(currentStart);

        // Next period will start on the 1st of next month
        const nextStart = new Date(
          currentStart.getFullYear(),
          currentStart.getMonth() + 1,
          1
        );

        periods.push({
          id: id--,
          startDate: new Date(currentStart),
          endDate: new Date(currentEnd),
          fromDateFormatted: format(currentStart, "dd/MM/yyyy"),
          toDateFormatted: format(currentEnd, "dd/MM/yyyy"),
        });

        currentStart = nextStart;
      }
    }

    return periods.slice(0, maxResults);
  }
  // MONTHLY logic
  else {
    // Adjust earliestTransactionDate to 1st of month
    periodStart = startOfMonth(periodStart);

    // Calculate periods from start to end
    const periods: DateRange[] = [];
    let currentStart = new Date(periodStart);

    while (currentStart <= periodEnd) {
      const currentEnd = endOfMonth(currentStart);

      // Next period will start on the 1st of next month
      const nextStart = new Date(
        currentStart.getFullYear(),
        currentStart.getMonth() + 1,
        1
      );

      periods.push({
        id: id--,
        startDate: new Date(currentStart),
        endDate: new Date(currentEnd),
        fromDateFormatted: format(currentStart, "dd/MM/yyyy"),
        toDateFormatted: format(currentEnd, "dd/MM/yyyy"),
      });

      currentStart = nextStart;
    }

    return periods.slice(0, maxResults);
  }
}

/**
 * Generates a downloadable file path for transaction export CSV
 */
export function generateCsvDownloadPath(
  startDate: Date,
  endDate: Date
): string {
  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");
  return `/api/transactions/export?startDate=${startStr}&endDate=${endStr}&format=csv`;
}

/**
 * Asynchronous version of getTransactionReportDateRanges that filters out periods with no transactions
 */
export async function getTransactionReportDateRangesWithFiltering(
  startDateStr?: string,
  endDateStr?: string,
  earliestTransactionDate?: Date,
  latestTransactionDate?: Date,
  hasTransactions?: (startDate: Date, endDate: Date) => Promise<boolean>,
  maxResults: number = 10
): Promise<DateRange[]> {
  // Get all potential periods
  const allPeriods = getTransactionReportDateRanges(
    startDateStr,
    endDateStr,
    earliestTransactionDate,
    latestTransactionDate,
    hasTransactions,
    maxResults * 2 // Get more periods than needed as some will be filtered
  );

  // If there's a custom date range or no hasTransactions function, return as is
  if ((startDateStr && endDateStr) || !hasTransactions) {
    return allPeriods.slice(0, maxResults);
  }

  // Filter periods to those that actually have transactions
  const filteredPeriods: DateRange[] = [];
  for (const period of allPeriods) {
    if (await hasTransactions(period.startDate, period.endDate)) {
      filteredPeriods.push(period);
      if (filteredPeriods.length >= maxResults) break;
    }
  }

  return filteredPeriods;
}
