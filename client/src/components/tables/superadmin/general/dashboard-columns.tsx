"use client";

import { ColumnDef } from "@tanstack/react-table";

// Updated type for commission data
export type CommissionOverview = {
  id: string; // OPERATOR, PLATINUM, GOLDEN
  pendingCommission: number | string; // Pending commission values
  releasedAllTime: number | string; // Released all time values
};

export const commissionOverviewColumns: ColumnDef<CommissionOverview>[] = [
  {
    accessorKey: "id",
    header: "", // Empty header for first column
    cell: ({ row }) => <span className="font-bold">{row.getValue("id")}</span>,
  },
  {
    accessorKey: "pendingCommission",
    header: "PENDING COMMISSION",
    cell: ({ row }) => {
      // Format numbers with commas if needed
      const value = row.getValue("pendingCommission");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
  {
    accessorKey: "releasedAllTime",
    header: "RELEASED ALL TIME",
    cell: ({ row }) => {
      // Format numbers with commas if needed
      const value = row.getValue("releasedAllTime");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
];

export type NetworkStatistics = {
  id: string;
  approved: number | string;
  pending: number | string;
  declined: number | string;
};

export const networkStatisticsColumn: ColumnDef<NetworkStatistics>[] = [
  {
    accessorKey: "id",
    header: "", // Empty header for first column
    cell: ({ row }) => (
      <>
        <h1 className="font-bold">{row.getValue("id")}</h1>
      </>
    ), // Display the actual ID value
  },
  {
    accessorKey: "approved",
    header: "APPROVED",
  },
  {
    accessorKey: "pending",
    header: "PENDING",
  },
  {
    accessorKey: "declined",
    header: "DECLINED",
  },
];

export type FinancialOverview = {
  item: string; // TOTAL BETS, TOTAL WINNINGS, etc.
  pendingCommission: number | string; // Pending commission values
  releasedAllTime: number | string; // Released all time values
  totalSummary: number | string; // SUMMARY values
};

export const financialOverviewColumns: ColumnDef<FinancialOverview>[] = [
  {
    accessorKey: "item",
    header: "ITEM",
    cell: ({ row }) => (
      <span className="font-bold">{row.getValue("item")}</span>
    ),
  },
  {
    accessorKey: "pendingCommission",
    header: "PENDING COMMISSION",
    cell: ({ row }) => {
      const value = row.getValue("pendingCommission");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
  {
    accessorKey: "releasedAllTime",
    header: "RELEASED ALL TIME",
    cell: ({ row }) => {
      const value = row.getValue("releasedAllTime");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
  {
    accessorKey: "totalSummary",
    header: "SUMMARY",
    cell: ({ row }) => {
      const value = row.getValue("totalSummary");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
];

export type CategoryFinancialOverview = {
  item: string; // TOTAL BETS, TOTAL WINNINGS, etc.
  dailyOverview: number | string | "N/A"; // Daily overview values
  pendingCommission: number | string; // Pending commission values
  releasedAllTime: number | string; // Released all time values
  totalSummary: number | string; // SUMMARY values
};

export const categoryFinancialOverviewColumns: ColumnDef<CategoryFinancialOverview>[] =
  [
    {
      accessorKey: "item",
      header: "ITEM",
      cell: ({ row }) => (
        <span className="font-bold">{row.getValue("item")}</span>
      ),
    },
    {
      accessorKey: "dailyOverview",
      header: "DAILY OVERVIEW",
      cell: ({ row }) => {
        const value = row.getValue("dailyOverview");
        if (value === "N/A") return value;
        return typeof value === "number" ? value.toLocaleString() : value;
      },
    },
    {
      accessorKey: "pendingCommission",
      header: "PENDING COMMISSION",
      cell: ({ row }) => {
        const value = row.getValue("pendingCommission");
        return typeof value === "number" ? value.toLocaleString() : value;
      },
    },
    {
      accessorKey: "releasedAllTime",
      header: "RELEASED ALL TIME",
      cell: ({ row }) => {
        const value = row.getValue("releasedAllTime");
        return typeof value === "number" ? value.toLocaleString() : value;
      },
    },
    {
      accessorKey: "totalSummary",
      header: "SUMMARY",
      cell: ({ row }) => {
        const value = row.getValue("totalSummary");
        return typeof value === "number" ? value.toLocaleString() : value;
      },
    },
  ];

export type SportsBettingOverview = {
  item: string; // TOTAL BETS, TOTAL GROSS COMMISSIONS, etc.
  dailyOverview: number | string | "N/A"; // Daily overview values
  pendingCommission: number | string; // Pending commission values
  releasedAllTime: number | string; // Released all time values
  totalSummary: number | string; // SUMMARY values
};

export const sportsBettingOverviewColumns: ColumnDef<SportsBettingOverview>[] =
  [
    {
      accessorKey: "item",
      header: "ITEM",
      cell: ({ row }) => (
        <span className="font-bold">{row.getValue("item")}</span>
      ),
    },
    {
      accessorKey: "dailyOverview",
      header: "DAILY OVERVIEW",
      cell: ({ row }) => {
        const value = row.getValue("dailyOverview");
        if (value === "N/A") return value;
        return typeof value === "number" ? value.toLocaleString() : value;
      },
    },
    {
      accessorKey: "pendingCommission",
      header: "PENDING COMMISSION",
      cell: ({ row }) => {
        const value = row.getValue("pendingCommission");
        return typeof value === "number" ? value.toLocaleString() : value;
      },
    },
    {
      accessorKey: "releasedAllTime",
      header: "RELEASED ALL TIME",
      cell: ({ row }) => {
        const value = row.getValue("releasedAllTime");
        return typeof value === "number" ? value.toLocaleString() : value;
      },
    },
    {
      accessorKey: "totalSummary",
      header: "SUMMARY",
      cell: ({ row }) => {
        const value = row.getValue("totalSummary");
        return typeof value === "number" ? value.toLocaleString() : value;
      },
    },
  ];

export type TopPerformersOverview = {
  operatorName: string; // Operator name, e.g., ETA-001
  pendingCommission: number | string; // Pending commission values
  releasedAllTime: number | string; // Released all time values
};

export const topPerformersColumns: ColumnDef<TopPerformersOverview>[] = [
  {
    accessorKey: "operatorName",
    header: "OPERATOR NAME",
    cell: ({ row }) => (
      <span className="font-bold">{row.getValue("operatorName")}</span>
    ),
  },
  {
    accessorKey: "pendingCommission",
    header: "PENDING COMMISSION",
    cell: ({ row }) => {
      const value = row.getValue("pendingCommission");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
  {
    accessorKey: "releasedAllTime",
    header: "RELEASED ALL TIME",
    cell: ({ row }) => {
      const value = row.getValue("releasedAllTime");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
];

export type TopPlayersDepositsOverview = {
  playerName: string; // Player name, e.g., Juan dela Cruz
  depositsMade: number | string; // Deposits made as of available cutoff period
  totalDeposits: number | string; // Total deposits to date
  operatorName: string; // Operator name
};

export const topPlayersDepositsColumns: ColumnDef<TopPlayersDepositsOverview>[] =
  [
    {
      accessorKey: "playerName",
      header: "PLAYER NAME",
      cell: ({ row }) => (
        <span className="font-bold">{row.getValue("playerName")}</span>
      ),
    },
    {
      accessorKey: "depositsMade",
      header: "DEPOSITS MADE AS OF AVAILABLE CUTOFF PERIOD",
      cell: ({ row }) => {
        const value = row.getValue("depositsMade");
        return typeof value === "number" ? value.toLocaleString() : value;
      },
    },
    {
      accessorKey: "totalDeposits",
      header: "TOTAL DEPOSITS TO DATE",
      cell: ({ row }) => {
        const value = row.getValue("totalDeposits");
        return typeof value === "number" ? value.toLocaleString() : value;
      },
    },
    {
      accessorKey: "operatorName",
      header: "OPERATOR NAME",
      cell: ({ row }) => row.getValue("operatorName"),
    },
  ];

// GGR Table
export type TopPlayersGGROverview = {
  playerName: string; // Player name
  ggrMade: number | string; // GGR made as of available cutoff period
  totalGGR: number | string; // Total GGR to date
  operatorName: string; // Operator name
};

export const topPlayersGGRColumns: ColumnDef<TopPlayersGGROverview>[] = [
  {
    accessorKey: "playerName",
    header: "PLAYER NAME",
    cell: ({ row }) => (
      <span className="font-bold">{row.getValue("playerName")}</span>
    ),
  },
  {
    accessorKey: "ggrMade",
    header: "GGR MADE AS OF AVAILABLE CUTOFF PERIOD",
    cell: ({ row }) => {
      const value = row.getValue("ggrMade");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
  {
    accessorKey: "totalGGR",
    header: "TOTAL GGR TO DATE",
    cell: ({ row }) => {
      const value = row.getValue("totalGGR");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
  {
    accessorKey: "operatorName",
    header: "OPERATOR NAME",
    cell: ({ row }) => row.getValue("operatorName"),
  },
];
