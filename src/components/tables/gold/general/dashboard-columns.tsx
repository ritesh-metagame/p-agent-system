// tableColumns.ts
import { ColumnDef } from "@tanstack/react-table";
//TODO: Define TypeScript types instead of interfaces for each table
// Define TypeScript interfaces for each table
interface NetworkOverview {
  network: string;
  approved: number;
  pending: number;
  suspended: number;
  total: number;
}

interface OverallSummary {
  item: string;
  pendingSettlement: string;
  previousSettled: string;
  totalSummary: string;
}

interface EGames {
  item: string;
  dailyOverview: string;
  pendingSettlement: string;
  previousSettled: string;
  totalSummary: string;
}

interface SportsBetting {
  item: string;
  dailyOverview: string;
  pendingSettlement: string;
  previousSettled: string;
  totalSummary: string;
}

interface TopPerformersDeposits {
  playerName: string;
  depositsCutoffPeriod: string;
  totalDepositsToDate: number;
}

interface TopPerformersGGR {
  playerName: string;
  ggrCutoffPeriod: string;
  totalGgrToDate: number;
}

// Define TypeScript interface for the table
interface NetworkCommissionSettlement {
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
export const topPerformersDepositsColumns: ColumnDef<TopPerformersDeposits>[] =
  [
    { accessorKey: "playerName", header: "PLAYER NAME" },
    {
      accessorKey: "depositsCutoffPeriod",
      header: "DEPOSITS MADE AS OF AVAILABLE CUTOFF PERIOD",
    },
    { accessorKey: "totalDepositsToDate", header: "TOTAL DEPOSITS TO DATE" },
  ];

// TOP PERFORMERS - GGR TABLE
export const topPerformersGgrColumns: ColumnDef<TopPerformersGGR>[] = [
  { accessorKey: "playerName", header: "PLAYER NAME" },
  {
    accessorKey: "ggrCutoffPeriod",
    header: "GGR MADE AS OF AVAILABLE CUTOFF PERIOD",
  },
  { accessorKey: "totalGgrToDate", header: "TOTAL GGR TO DATE" },
];
