import { ColumnDef } from "@tanstack/react-table";

/**
 * Cutoff Period Table
 */
export type PlatinumCutoffPeriodData = {
  commissionPendingSettlement: string;
  commissionSettled: string;
};

export const platinumcutoffPeriodColumns: ColumnDef<PlatinumCutoffPeriodData>[] =
  [
    {
      accessorKey: "commissionPendingSettlement",
      header: "COMMISSION PENDING SETTLEMENT",
    },
    {
      accessorKey: "commissionSettled",
      header: "COMMISSION SETTLED",
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
  summary: number | string;
};

export const platinumnetworkOverviewColumns: ColumnDef<PlatinumNetworkOverviewData>[] =
  [
    {
      accessorKey: "network",
      header: "NETWORK",
      cell: ({ row }) => (
        <>
          <h1 className="font-bold">{row.getValue("network")}</h1>
        </>
      ),
    },
    { accessorKey: "approved", header: "APPROVED" },
    { accessorKey: "pending", header: "PENDING" },
    { accessorKey: "suspended", header: "SUSPENDED" },
    { accessorKey: "summary", header: "SUMMARY" },
  ];

/**
 * Overall Summary (E-Games & Sportsbetting) Table
 */
export type PlatinumOverallSummaryData = {
  item: string;
  pendingSettlement: number | string;
  previousSettled: number | string;
  summary: number | string;
};

export const platinumoverallSummaryColumns: ColumnDef<PlatinumOverallSummaryData>[] =
  [
    {
      accessorKey: "item",
      header: "ITEM",
      cell: ({ row }) => (
        <>
          <h1 className="font-bold">{row.getValue("item")}</h1>
        </>
      ),
    },
    { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
    { accessorKey: "previousSettled", header: "PREVIOUS SETTLED (Cumulative)" },
    { accessorKey: "summary", header: "SUMMARY" },
  ];

/**
 * E-Games Table
 */
export type PlatinumEGamesData = {
  item: string;
  dailyOverview: number | string;
  pendingSettlement: number | string;
  previousSettled: number | string;
  summary: number | string;
};

export const platinumeGamesColumns: ColumnDef<PlatinumEGamesData>[] = [
  {
    accessorKey: "item",
    header: "ITEM",
    cell: ({ row }) => (
      <>
        <h1 className="font-bold">{row.getValue("item")}</h1>
      </>
    ),
  },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED " },
  { accessorKey: "summary", header: "SUMMARY" },
];

/**
 * Sportsbetting Table
 */
export type PlatinumSportsbettingData = {
  item: string;
  dailyOverview: number | string;
  pendingSettlement: number | string;
  previousSettled: number | string;
  summary: number | string;
};

export const platinumsportsbettingColumns: ColumnDef<PlatinumSportsbettingData>[] =
  [
    {
      accessorKey: "item",
      header: "ITEM",
      cell: ({ row }) => (
        <>
          <h1 className="font-bold">{row.getValue("item")}</h1>
        </>
      ),
    },
    { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
    { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
    { accessorKey: "previousSettled", header: "PREVIOUS SETTLED " },
    { accessorKey: "summary", header: "SUMMARY" },
  ];

/**
 * Top Performers (All Time) Table
 */
export type PlatinumTopPerformersAllTimeData = {
  goldenName: string;
  pendingCommission: number | string;
  released: number | string;
};

export const platinumtopPerformersAllTimeColumns: ColumnDef<PlatinumTopPerformersAllTimeData>[] =
  [
    {
      accessorKey: "goldenName",
      header: "GOLDEN NAME",
      cell: ({ row }) => (
        <>
          <h1 className="font-bold">{row.getValue("goldenName")}</h1>
        </>
      ),
    },
    {
      accessorKey: "pendingCommission",
      header: "PENDING COMMISSION ",
    },
    { accessorKey: "released", header: "RELEASED " },
  ];

/**
 * Top Performers (Per Cutoff) Table
 */
export type PlatinumTopPerformersPerCutoffData = {
  goldenName: string;
  pendingCommission: number | string;
  released: number | string;
};

export const platinumtopPerformersPerCutoffColumns: ColumnDef<PlatinumTopPerformersPerCutoffData>[] =
  [
    {
      accessorKey: "goldenName",
      header: "GOLDEN NAME",
      cell: ({ row }) => (
        <>
          <h1 className="font-bold">{row.getValue("goldenName")}</h1>
        </>
      ),
    },
    {
      accessorKey: "pendingCommission",
      header: "PENDING COMMISSION ",
    },
    { accessorKey: "released", header: "RELEASED " },
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
