import { ColumnDef } from "@tanstack/react-table";

/**
 * Cutoff Period Table
 */
export type CutoffPeriodData = {
  networkCommissionPendingSettlement: string;
  allTimeNetworkCommissionSettled: string;
};

export const cutoffPeriodColumns: ColumnDef<CutoffPeriodData>[] = [
  {
    accessorKey: "networkCommissionPendingSettlement",
    header: "NETWORK COMMISSION PENDING SETTLEMENT",
  },
  {
    accessorKey: "allTimeNetworkCommissionSettled",
    header: "ALL TIME NETWORK COMMISSION SETTLED",
  },
];

/**
 * Network Overview Table
 */
export type NetworkOverviewData = {
  network: string;
  approved: number | string;
  pending: number | string;
  suspended: number | string;
  total: number | string;
};

export const networkOverviewColumns: ColumnDef<NetworkOverviewData>[] = [
  { accessorKey: "network", header: "Network" },
  { accessorKey: "approved", header: "Approved" },
  { accessorKey: "pending", header: "Pending" },
  { accessorKey: "suspended", header: "Suspended" },
  { accessorKey: "total", header: "TOTAL" },
];

/**
 * Overall Summary (E-Games & Sportsbetting) Table
 */
export type OverallSummaryData = {
  item: string;
  pendingSettlement: number | string;
  previousSettled: number | string;
  totalSummary: number | string;
};

export const overallSummaryColumns: ColumnDef<OverallSummaryData>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED (Cumulative)" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

/**
 * E-Games Table
 */
export type EGamesData = {
  item: string;
  dailyOverview: number | string;
  pendingSettlement: number | string;
  previousSettled: number | string;
  totalSummary: number | string;
};

export const eGamesColumns: ColumnDef<EGamesData>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED (Cumulative)" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

/**
 * Sportsbetting Table
 */
export type SportsbettingData = {
  item: string;
  dailyOverview: number | string;
  pendingSettlement: number | string;
  previousSettled: number | string;
  totalSummary: number | string;
};

export const sportsbettingColumns: ColumnDef<SportsbettingData>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED (Cumulative)" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

/**
 * Top Performers (All Time) Table
 */
export type TopPerformersAllTimeData = {
  goldenName: string;
  pendingCommission: number | string;
  releasedAllTime: number | string;
};

export const topPerformersAllTimeColumns: ColumnDef<TopPerformersAllTimeData>[] =
  [
    { accessorKey: "goldenName", header: "GOLDEN NAME" },
    {
      accessorKey: "pendingCommission",
      header: "PENDING COMMISSION AS OF AVAILABLE CUTOFF PERIOD",
    },
    { accessorKey: "releasedAllTime", header: "RELEASED ALL TIME" },
  ];

/**
 * Top Performers (Per Cutoff) Table
 */
export type TopPerformersPerCutoffData = {
  goldenName: string;
  pendingCommission: number | string;
  releasedAllTime: number | string;
};

export const topPerformersPerCutoffColumns: ColumnDef<TopPerformersPerCutoffData>[] =
  [
    { accessorKey: "goldenName", header: "GOLDEN NAME" },
    {
      accessorKey: "pendingCommission",
      header: "PENDING COMMISSION AS OF AVAILABLE CUTOFF PERIOD",
    },
    { accessorKey: "releasedAllTime", header: "RELEASED ALL TIME" },
  ];

/**
 * Export all table column definitions
 */
export const tableColumns = {
  cutoffPeriodColumns,
  networkOverviewColumns,
  overallSummaryColumns,
  eGamesColumns,
  sportsbettingColumns,
  topPerformersAllTimeColumns,
  topPerformersPerCutoffColumns,
};
