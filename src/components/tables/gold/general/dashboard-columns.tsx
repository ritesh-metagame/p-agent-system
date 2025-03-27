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
<<<<<<< HEAD
  summary: number;
=======
  total: number;
>>>>>>> b84d61bc4a0c6bb5aee5ab18a038d444380634c8
};

export type GoldOverallSummary = {
  item: string;
  pendingSettlement: string;
  previousSettled: string;
<<<<<<< HEAD
  summary: string;
=======
  totalSummary: string;
>>>>>>> b84d61bc4a0c6bb5aee5ab18a038d444380634c8
};

export type GoldEGames = {
  item: string;
  dailyOverview: string;
  pendingSettlement: string;
  previousSettled: string;
<<<<<<< HEAD
  summary: string;
=======
  totalSummary: string;
>>>>>>> b84d61bc4a0c6bb5aee5ab18a038d444380634c8
};

export type GoldSportsBetting = {
  item: string;
  dailyOverview: string;
  pendingSettlement: string;
  previousSettled: string;
<<<<<<< HEAD
  summary: string;
=======
  totalSummary: string;
>>>>>>> b84d61bc4a0c6bb5aee5ab18a038d444380634c8
};

export type GoldTopPerformersDeposits = {
  playerName: string;
<<<<<<< HEAD
  deposits: string;
  depositsToDate: string;
=======
  depositsCutoffPeriod: string;
  totalDepositsToDate: number;
>>>>>>> b84d61bc4a0c6bb5aee5ab18a038d444380634c8
};

export type GoldTopPerformersGGR = {
  playerName: string;
<<<<<<< HEAD
  ggr: string;
  ggrToDate: string;
=======
  ggrCutoffPeriod: string;
  totalGgrToDate: number;
>>>>>>> b84d61bc4a0c6bb5aee5ab18a038d444380634c8
};

// Define TypeScript interface for the table
export type GoldNetworkCommissionSettlement = {
<<<<<<< HEAD
  commissionPendingSettlement: string;
  commissionSettled: string;
=======
  pendingSettlement: string;
  allTimeSettled: string;
>>>>>>> b84d61bc4a0c6bb5aee5ab18a038d444380634c8
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
<<<<<<< HEAD
  { accessorKey: "summary", header: " SUMMARY" },
=======
  { accessorKey: "totalSummary", header: "SUMMARY" },
>>>>>>> b84d61bc4a0c6bb5aee5ab18a038d444380634c8
];

// E-GAMES TABLE
export const goldeGamesColumns: ColumnDef<GoldEGames>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
<<<<<<< HEAD
  { accessorKey: "summary", header: "SUMMARY" },
=======
  { accessorKey: "totalSummary", header: "SUMMARY" },
>>>>>>> b84d61bc4a0c6bb5aee5ab18a038d444380634c8
];

// SPORTS BETTING TABLE
export const goldsportsBettingColumns: ColumnDef<GoldSportsBetting>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
<<<<<<< HEAD
  { accessorKey: "summary", header: "SUMMARY" },
=======
  { accessorKey: "totalSummary", header: "SUMMARY" },
>>>>>>> b84d61bc4a0c6bb5aee5ab18a038d444380634c8
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
