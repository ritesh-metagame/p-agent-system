// tableColumns.ts
"use client;";
import { Button } from "@/components/ui/button";
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
  pendingCommission: string;
  released: string;
};

export type OperatorTopPerformersPerCutoff = {
  platinumName: string;
  pendingCommission: string;
  released: string;
};

export type NetworkStats = {
  ppApproved: number;
  ppPending: number;
  gpApproved: number;
  gpPending: number;
  players: number;
};

// Partner Network commission
export type PartnerNetworkCommission = {
  platinumPartner: string;
  pendingCommission: number;
  status: string;
  allTime: number;
  summary: number;
};

// Define TypeScript interface for the table
export type OperatorNetworkCommissionSettlement = {
  pendingSettlement: string;
  allTimeSettled: string;
};

export type CommissionRecentCutOff = {
  platinumPartner: string;
  totalBets: number;
  totalWinnings: number;
  ggr: number;
  grossCommission: number;
  totalDeduction: number;
  netCommission: number;
  partnerBreakDown: { label: string }[]; // Array of objects for buttons
  releaseCommissions: { label: string }[];
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
    { accessorKey: "totalSummary", header: "SUMMARY" },
  ];

// E-GAMES TABLE
export const operatoreGamesColumns: ColumnDef<OperatorEGames>[] = [
  { accessorKey: "item", header: "ITEM" },
  { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
  { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
  { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
  { accessorKey: "totalSummary", header: "SUMMARY" },
];

// SPORTS BETTING TABLE
export const operatorsportsBettingColumns: ColumnDef<OperatorSportsBetting>[] =
  [
    { accessorKey: "item", header: "ITEM" },
    { accessorKey: "dailyOverview", header: "DAILY OVERVIEW" },
    { accessorKey: "pendingSettlement", header: "PENDING SETTLEMENT" },
    { accessorKey: "previousSettled", header: "PREVIOUS SETTLED" },
    { accessorKey: "totalSummary", header: "SUMMARY" },
  ];

// TOP PERFORMERS - DEPOSITS TABLE
export const operatorTopPerformersAllTime: ColumnDef<OperatorTopPerformersAllTime>[] =
  [
    { accessorKey: "platinumName", header: "PLATINUM NAME" },
    {
      accessorKey: "pendingCommission",
      header: "PENDING COMMISSION ",
    },
    { accessorKey: "released", header: "RELEASED " },
  ];

// TOP PERFORMERS - GGR TABLE
export const operatortopPerformersPerCutoff: ColumnDef<OperatorTopPerformersPerCutoff>[] =
  [
    { accessorKey: "platinumName", header: "PLATINUM NAME" },
    {
      accessorKey: "pendingCommission",
      header: "PENDING COMMISSION ",
    },
    { accessorKey: "released", header: "RELEASED " },
  ];

// NETWORK STATS
export const networkStats: ColumnDef<NetworkStats>[] = [
  { accessorKey: "ppApproved", header: "PP APPROVED" },
  {
    accessorKey: "ppPending",
    header: "PP PENDING",
  },
  { accessorKey: "gpApproved", header: "GP APPROVED" },
  { accessorKey: "gpPending", header: "GP PENDING" },
  { accessorKey: "players", header: "PLAYERS" },
];

// NETWORK COMMISSION

export const partnerNetworkCommission: ColumnDef<PartnerNetworkCommission>[] = [
  { accessorKey: "platinumPartner", header: "PLATINUM PARTNER" },
  {
    accessorKey: "pendingCommission",
    header: "PENDING COMMISSION",
  },
  { accessorKey: "status", header: "STATUS" },
  { accessorKey: "allTime", header: "ALL TIME" },
  { accessorKey: "summary", header: "SUMMARY" },
];

export const commissionRecentCutsOff: ColumnDef<CommissionRecentCutOff>[] = [
  { accessorKey: "platinumPartner", header: "PLATINUM PARTNER" },
  {
    accessorKey: "totalBets",
    header: "TOTAL BETES",
  },
  { accessorKey: "totalWinnings", header: "TOTAL WINNINGS" },
  { accessorKey: "ggr", header: "GGR" },
  { accessorKey: "grossCommission", header: "GROSS COMMISSION" },
  { accessorKey: "totalDeduction", header: "TOTAL DEDUCTION" },
  { accessorKey: "netCommission", header: "NET COMMISSION" },
  {
    accessorKey: "partnerBreakDown",
    header: "PARTNER BREAK DOWN",
    cell: ({ row }) =>
      row.original.partnerBreakDown?.map((item, index) => (
        <Button
          key={index}
          className="w-full p-2 mr-2 flex justify-center items-center text-center"
          style={{ backgroundColor: "rgb(93,148,180)" }}
        >
          {item.label}
        </Button>
      )),
  },
  // Render buttons for releaseCommissions
  {
    accessorKey: "releaseCommissions",
    header: "RELEASE COMMISSIONS",
    cell: ({ row }) =>
      row.original.releaseCommissions?.map((item, index) => (
        <Button
          key={index}
          className="w-full p-2 mr-2 flex justify-center items-center text-center text-white"
          style={{ backgroundColor: "rgb(93,148,180)" }}
        >
          {item.label}
        </Button>
      )),
  },
];
