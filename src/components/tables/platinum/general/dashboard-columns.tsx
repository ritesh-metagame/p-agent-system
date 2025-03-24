import { ColumnDef } from "@tanstack/react-table";

/**
 * Cutoff Period Table
 */
export type PlatinumCutoffPeriodData = {
  networkCommissionPendingSettlement: string;
  allTimeNetworkCommissionSettled: string;
};

export const platinumcutoffPeriodColumns: ColumnDef<PlatinumCutoffPeriodData>[] = [
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
export type PlatinumNetworkOverviewData = {
  network: string;
  approved: number | string;
  pending: number | string;
  suspended: number | string;
  total: number | string;
};

export const platinumnetworkOverviewColumns: ColumnDef<PlatinumNetworkOverviewData>[] = [
  { accessorKey: "network", header: "Network" },
  { accessorKey: "approved", header: "Approved" },
  { accessorKey: "pending", header: "Pending" },
  { accessorKey: "suspended", header: "Suspended" },
  { accessorKey: "total", header: "TOTAL" },
];

/**
 * Overall Summary (E-Games & Sportsbetting) Table
 */
export type PlatinumOverallSummaryData = {
  item: string;
  pendingSettlement: number | string;
  previousSettled: number | string;
  totalSummary: number | string;
};

export const platinumoverallSummaryColumns: ColumnDef<PlatinumOverallSummaryData>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED (Cumulative)" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

/**
 * E-Games Table
 */
export type PlatinumEGamesData = {
  item: string;
  dailyOverview: number | string;
  pendingSettlement: number | string;
  previousSettled: number | string;
  totalSummary: number | string;
};

export const platinumeGamesColumns: ColumnDef<PlatinumEGamesData>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED (Cumulative)" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

/**
 * Sportsbetting Table
 */
export type PlatinumSportsbettingData = {
  item: string;
  dailyOverview: number | string;
  pendingSettlement: number | string;
  previousSettled: number | string;
  totalSummary: number | string;
};

export const platinumsportsbettingColumns: ColumnDef<PlatinumSportsbettingData>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED (Cumulative)" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

/**
 * Top Performers (All Time) Table
 */
export type PlatinumTopPerformersAllTimeData = {
  goldenName: string;
  pendingCommission: number | string;
  releasedAllTime: number | string;
};

export const platinumtopPerformersAllTimeColumns: ColumnDef<PlatinumTopPerformersAllTimeData>[] =
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
export type PlatinumTopPerformersPerCutoffData = {
  goldenName: string;
  pendingCommission: number | string;
  releasedAllTime: number | string;
};

export const platinumtopPerformersPerCutoffColumns: ColumnDef<PlatinumTopPerformersPerCutoffData>[] =
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
  platinumcutoffPeriodColumns,
  platinumnetworkOverviewColumns,
  platinumoverallSummaryColumns,
  platinumeGamesColumns,
  platinumsportsbettingColumns,
  platinumtopPerformersAllTimeColumns,
  platinumtopPerformersPerCutoffColumns,
};
