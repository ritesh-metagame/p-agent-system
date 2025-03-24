// tableColumns.ts
"use client;"
import { ColumnDef } from "@tanstack/react-table";
//TODO: Define TypeScript types instead of interfaces for each table
// Define TypeScript interfaces for each table
export type NetworkOverview = {
  network: string;
  approved: number;
  pending: number;
  suspended: number;
  total: number;
}

export type OverallSummary=  {
  item: string;
  pendingSettlement: string;
  previousSettled: string;
  totalSummary: string;
}

export type EGames = {
  item: string;
  dailyOverview: string;
  pendingSettlement: string;
  previousSettled: string;
  totalSummary: string;
}

export type SportsBetting = {
  item: string;
  dailyOverview: string;
  pendingSettlement: string;
  previousSettled: string;
  totalSummary: string;
}

export type TopPerformersAllTime=  {
  platinumName: string;
  depositsCutoffPeriod: string;
  totalDepositsToDate: number;
}

export type TopPerformersPerCutoff=  {
  platinumName: string;
  ggrCutoffPeriod: string;
  totalGgrToDate: number;
}

// Define TypeScript interface for the table
export type NetworkCommissionSettlement = {
  pendingSettlement: string;
  allTimeSettled: string;
}

// Define column structure for the table
export const networkCommissionSettlementColumns: ColumnDef<NetworkCommissionSettlement>[] =
  [
    {
      accessorKey: "pendingSettlement",
      header: "NETWORK COMMISSION PENDING SETTLEMENT",
    },
    {
      accessorKey: "allTimeSettled",
      header: "ALL TIME NETWORK COMMISSION SETTLED",
    },
  ];

// NETWORK OVERVIEW TABLE
export const networkOverviewColumns: ColumnDef<NetworkOverview>[] = [
  { accessorKey: "network", header: "Network" },
  { accessorKey: "approved", header: "Approved" },
  { accessorKey: "pending", header: "Pending" },
  { accessorKey: "suspended", header: "Suspended" },
  { accessorKey: "total", header: "Total" },
];

// OVERALL SUMMARY TABLE
export const overallSummaryColumns: ColumnDef<OverallSummary>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

// E-GAMES TABLE
export const eGamesColumns: ColumnDef<EGames>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

// SPORTS BETTING TABLE
export const sportsBettingColumns: ColumnDef<SportsBetting>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

// TOP PERFORMERS - DEPOSITS TABLE
export const TopPerformersAllTime: ColumnDef<TopPerformersAllTime>[] =
  [
    { accessorKey: "platinumName", header: "PLATINUM NAME" },
    {
      accessorKey: "pendingCommissionAsOfAvailableCutoffPeriod",
      header: "PENDING COMMISSION AS OF AVAILABLE CUTOFF PERIOD",
    },
    { accessorKey: "releasedAllTime", header: "RELEASED ALL TIME" },
  ];

// TOP PERFORMERS - GGR TABLE
export const topPerformersPerCutoff: ColumnDef<TopPerformersPerCutoff>[] = [
  { accessorKey: "platinumName", header: "PLATINUM NAME"  },
  {
    accessorKey: "pendingCommissionAsOfAvailableCutoffPeriod",
    header: "PENDING COMMISSION AS OF AVAILABLE CUTOFF PERIOD",
  },
  { accessorKey: "releasedAllTime", header: "RELEASED ALL TIME" },
];
