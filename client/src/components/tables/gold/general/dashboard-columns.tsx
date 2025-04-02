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
  summary: number;
};

export type GoldOverallSummary = {
  item: string;
  pendingSettlement: string;
  previousSettled: string;
  summary: string;
};

export type GoldEGames = {
  item: string;
  dailyOverview: string;
  pendingSettlement: string;
  previousSettled: string;
  summary: string;
};

export type GoldSportsBetting = {
  item: string;
  dailyOverview: string;
  pendingSettlement: string;
  previousSettled: string;
  summary: string;
};

export type GoldTopPerformersDeposits = {
  playerName: string;
  deposits: string;
  depositsToDate: string;
};

export type GoldTopPerformersGGR = {
  playerName: string;
  ggr: string;
  ggrToDate: string;
};

// Define TypeScript interface for the table
export type GoldNetworkCommissionSettlement = {
  commissionPendingSettlement: string;
  commissionSettled: string;
};

// Define column structure for the table
export const goldnetworkCommissionSettlementColumns: ColumnDef<GoldNetworkCommissionSettlement>[] =
  [
    {
      accessorKey: "commissionPendingSettlement",
      header: " COMMISSION PENDING SETTLEMENT",
    },
    {
      accessorKey: "commissionSettled",
      header: "COMMISSION SETTLED",
    },
  ];

// NETWORK OVERVIEW TABLE
export const goldnetworkOverviewColumns: ColumnDef<GoldNetworkOverview>[] = [
  { accessorKey: "network", header: "NETWORK" },
  { accessorKey: "approved", header: "APPROVED" },
  { accessorKey: "pending", header: "PENDING" },
  { accessorKey: "suspended", header: "SUSPENDED" },
  { accessorKey: "summary", header: "SUMMARY" },
];

// OVERALL SUMMARY TABLE
export const goldoverallSummaryColumns: ColumnDef<GoldOverallSummary>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
  { accessorKey: "summary", header: " SUMMARY" },
];

// E-GAMES TABLE
export const goldeGamesColumns: ColumnDef<GoldEGames>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
  { accessorKey: "summary", header: "SUMMARY" },
];

// SPORTS BETTING TABLE
export const goldsportsBettingColumns: ColumnDef<GoldSportsBetting>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
  { accessorKey: "summary", header: "SUMMARY" },
];

// TOP PERFORMERS - DEPOSITS TABLE
export const goldtopPerformersDepositsColumns: ColumnDef<GoldTopPerformersDeposits>[] =
  [
    { accessorKey: "playerName", header: "PLAYER NAME" },
    {
      accessorKey: "deposits",
      header: "DEPOSITS",
    },
    { accessorKey: "depositsToDate", header: "DEPOSITS TO DATE" },
  ];

// TOP PERFORMERS - GGR TABLE
export const goldtopPerformersGgrColumns: ColumnDef<GoldTopPerformersGGR>[] = [
  { accessorKey: "playerName", header: "PLAYER NAME" },
  {
    accessorKey: "ggr",
    header: "GGR",
  },
  { accessorKey: "ggrToDate", header: "GGR TO DATE" },
];
