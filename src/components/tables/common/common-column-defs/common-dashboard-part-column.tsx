// // tableColumns.ts
// "use client;";
// import { ColumnDef } from "@tanstack/react-table";

// export type NetworkCommissionSettlement = {
//   pendingSettlement: string;
//   allTimeSettled: string;
// };

// export type NetworkOverview = {
//   network: string;
//   approved: number;
//   pending: number;
//   suspended: number;
//   total: number;
// };

// export type OverallSummary = {
//   item: string;
//   pendingSettlement: string;
//   previousSettled: string;
//   totalSummary: string;
// };

// export type EGames = {
//   item: string;
//   dailyOverview: string;
//   pendingSettlement: string;
//   previousSettled: string;
//   totalSummary: string;
// };

// export type SportsBetting = {
//   item: string;
//   dailyOverview: string;
//   pendingSettlement: string;
//   previousSettled: string;
//   totalSummary: string;
// };

// // Define column structure for the table
// export const NetworkCommissionSettlementColumns: ColumnDef<NetworkCommissionSettlement>[] =
//   [
//     {
//       accessorKey: "pendingSettlement",
//       header: "COMMISSION PENDING SETTLEMENT",
//     },
//     {
//       accessorKey: "allTimeSettled",
//       header: "COMMISSION SETTLED",
//     },
//   ];

// // NETWORK OVERVIEW TABLE
// export const NetworkOverviewColumns: ColumnDef<NetworkOverview>[] = [
//   { accessorKey: "network", header: "NETWORK" },
//   { accessorKey: "approved", header: "APPROVED" },
//   { accessorKey: "pending", header: "PENDING" },
//   { accessorKey: "suspended", header: "SUSPENDED" },
//   { accessorKey: "total", header: "TOTAL" },
// ];

// // OVERALL SUMMARY TABLE
// export const overallSummaryColumns: ColumnDef<OverallSummary>[] = [
//   { accessorKey: "item", header: "ITEM" },
//   { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
//   { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
//   { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
// ];

// // E-GAMES TABLE
// export const eGamesColumns: ColumnDef<EGames>[] = [
//   { accessorKey: "item", header: "ITEM" },
//   { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
//   { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
//   { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
//   { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
// ];

// // SPORTS BETTING TABLE
// export const sportsBettingColumns: ColumnDef<SportsBetting>[] = [
//   { accessorKey: "item", header: "ITEM" },
//   { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
//   { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
//   { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
//   { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
// ];

import { ColumnDef } from "@tanstack/react-table";

/**
 * Cutoff Period Table
 */
export type CutoffPeriodData = {
  commissionPendingSettlement: string;
  commissionSettled: string;
};

export const cutoffPeriodColumns: ColumnDef<CutoffPeriodData>[] = [
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
export type NetworkOverviewData = {
  network: string;
  approved: number | string;
  pending: number | string;
  suspended: number | string;
  summary: number | string;
};

export const networkOverviewColumns: ColumnDef<NetworkOverviewData>[] = [
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
export type OverallSummaryData = {
  item: string;
  pendingSettlement: number | string;
  previousSettled: number | string;
  summary: number | string;
};

export const overallSummaryColumns: ColumnDef<OverallSummaryData>[] = [
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
export type EGamesData = {
  item: string;
  dailyOverview: number | string;
  pendingSettlement: number | string;
  previousSettled: number | string;
  summary: number | string;
};

export const eGamesColumns: ColumnDef<EGamesData>[] = [
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
export type SportsbettingData = {
  item: string;
  dailyOverview: number | string;
  pendingSettlement: number | string;
  previousSettled: number | string;
  summary: number | string;
};

export const sportsbettingColumns: ColumnDef<SportsbettingData>[] = [
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
 * Export all table column definitions
 */
export const tableColumns = {
  cutoffPeriodColumns,
  networkOverviewColumns,
  overallSummaryColumns,
  eGamesColumns,
  sportsbettingColumns,
};
