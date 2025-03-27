// tableColumns.ts
"use client;gold";
import { ColumnDef } from "@tanstack/react-table";
//TODO: Define TypeScript types instead of interfaces for each table
// Define TypeScript interfaces for each table
export type GoldNetworkOverview = {
  network: string;
  approved: number;
  pending: number;
  suspended: number;
  total: number;
};

export type GoldOverallSummary = {
  item: string;
  pendingSettlement: string;
  previousSettled: string;
  totalSummary: string;
};

export type GoldEGames = {
  item: string;
  dailyOverview: string;
  pendingSettlement: string;
  previousSettled: string;
  totalSummary: string;
};

export type GoldSportsBetting = {
  item: string;
  dailyOverview: string;
  pendingSettlement: string;
  previousSettled: string;
  totalSummary: string;
};

export type GoldTopPerformersDeposits = {
  playerName: string;
  depositsCutoffPeriod: string;
  totalDepositsToDate: string;
};

export type GoldTopPerformersGGR = {
  playerName: string;
  ggrCutoffPeriod: string;
  totalGgrToDate: string;
};

// Define TypeScript interface for the table
export type GoldNetworkCommissionSettlement = {
  pendingSettlement: string;
  allTimeSettled: string;
};

// Define column structure for the table
export const goldnetworkCommissionSettlementColumns: ColumnDef<GoldNetworkCommissionSettlement>[] =
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
export const goldnetworkOverviewColumns: ColumnDef<GoldNetworkOverview>[] = [
  { accessorKey: "network", header: "Network" },
  { accessorKey: "approved", header: "Approved" },
  { accessorKey: "pending", header: "Pending" },
  { accessorKey: "suspended", header: "Suspended" },
  { accessorKey: "total", header: "Total" },
];

// OVERALL SUMMARY TABLE
export const goldoverallSummaryColumns: ColumnDef<GoldOverallSummary>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

// E-GAMES TABLE
export const goldeGamesColumns: ColumnDef<GoldEGames>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

// SPORTS BETTING TABLE
export const goldsportsBettingColumns: ColumnDef<GoldSportsBetting>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

// TOP PERFORMERS - DEPOSITS TABLE
export const goldtopPerformersDepositsColumns: ColumnDef<GoldTopPerformersDeposits>[] =
  [
    { accessorKey: "playerName", header: "PLAYER NAME" },
    {
      accessorKey: "depositsCutoffPeriod",
      header: "DEPOSITS MADE AS OF AVAILABLE CUTOFF PERIOD",
    },
    { accessorKey: "totalDepositsToDate", header: "TOTAL DEPOSITS TO DATE" },
  ];

// TOP PERFORMERS - GGR TABLE
export const goldtopPerformersGgrColumns: ColumnDef<GoldTopPerformersGGR>[] = [
  { accessorKey: "playerName", header: "PLAYER NAME" },
  {
    accessorKey: "ggrCutoffPeriod",
    header: "GGR MADE AS OF AVAILABLE CUTOFF PERIOD",
  },
  { accessorKey: "totalGgrToDate", header: "TOTAL GGR TO DATE" },
];
