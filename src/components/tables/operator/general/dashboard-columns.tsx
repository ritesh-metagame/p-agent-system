// tableColumns.ts
"use client;";
import { ColumnDef } from "@tanstack/react-table";
//TODO: Define TypeScript types instead of interfaces for each table
// Define TypeScript interfaces for each table
export type OperatorNetworkOverview = {
  network: string;
  approved: number;
  pending: number;
  suspended: number;
  total: number;
};

export type OperatorOverallSummary = {
  item: string;
  pendingSettlement: string;
  previousSettled: string;
  totalSummary: string;
};

export type OperatorEGames = {
  item: string;
  dailyOverview: string;
  pendingSettlement: string;
  previousSettled: string;
  totalSummary: string;
};

export type OperatorSportsBetting = {
  item: string;
  dailyOverview: string;
  pendingSettlement: string;
  previousSettled: string;
  totalSummary: string;
};

export type OperatorTopPerformersAllTime = {
  platinumName: string;
  depositsCutoffPeriod: string;
  totalDepositsToDate: number;
};

export type OperatorTopPerformersPerCutoff = {
  platinumName: string;
  ggrCutoffPeriod: string;
  totalGgrToDate: number;
};

// Define TypeScript interface for the table
export type OperatorNetworkCommissionSettlement = {
  pendingSettlement: string;
  allTimeSettled: string;
};

// Define column structure for the table
export const operatorNetworkCommissionSettlementColumns: ColumnDef<OperatorNetworkCommissionSettlement>[] =
  [
    {
      accessorKey: "pendingSettlement",
      header: "COMMISSION PENDING SETTLEMENT",
    },
    {
      accessorKey: "allTimeSettled",
      header: "COMMISSION SETTLED",
    },
  ];

// NETWORK OVERVIEW TABLE
export const operatorNetworkOverviewColumns: ColumnDef<OperatorNetworkOverview>[] =
  [
    { accessorKey: "network", header: "NETWORK" },
    { accessorKey: "approved", header: "APPROVED" },
    { accessorKey: "pending", header: "PENDING" },
    { accessorKey: "suspended", header: "SUSPENDED" },
    { accessorKey: "total", header: "TOTAL" },
  ];

// OVERALL SUMMARY TABLE
export const operatoroverallSummaryColumns: ColumnDef<OperatorOverallSummary>[] =
  [
    { accessorKey: "item", header: "ITEM" },
    { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
    { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
    { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
  ];

// E-GAMES TABLE
export const operatoreGamesColumns: ColumnDef<OperatorEGames>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
  { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
];

// SPORTS BETTING TABLE
export const operatorsportsBettingColumns: ColumnDef<OperatorSportsBetting>[] =
  [
    { accessorKey: "item", header: "ITEM" },
    { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
    { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
    { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
    { accessorKey: "totalSummary", header: "TOTAL SUMMARY" },
  ];

// TOP PERFORMERS - DEPOSITS TABLE
export const operatorTopPerformersAllTime: ColumnDef<OperatorTopPerformersAllTime>[] =
  [
    { accessorKey: "platinumName", header: "PLATINUM NAME" },
    {
      accessorKey: "pendingCommissionAsOfAvailableCutoffPeriod",
      header: "PENDING COMMISSION AS OF AVAILABLE CUTOFF PERIOD",
    },
    { accessorKey: "releasedAllTime", header: "RELEASED ALL TIME" },
  ];

// TOP PERFORMERS - GGR TABLE
export const operatortopPerformersPerCutoff: ColumnDef<OperatorTopPerformersPerCutoff>[] =
  [
    { accessorKey: "platinumName", header: "PLATINUM NAME" },
    {
      accessorKey: "pendingCommissionAsOfAvailableCutoffPeriod",
      header: "PENDING COMMISSION AS OF AVAILABLE CUTOFF PERIOD",
    },
    { accessorKey: "releasedAllTime", header: "RELEASED ALL TIME" },
  ];
