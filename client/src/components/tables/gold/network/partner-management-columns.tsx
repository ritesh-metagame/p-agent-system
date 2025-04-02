"use client";

import { ColumnDef } from "@tanstack/react-table";

//!enum needs approval

// Define enum for Status

export type GoldNetworkStats = {
  players: string;
};

export const goldNetworkStatsColumns: ColumnDef<GoldNetworkStats>[] = [
  {
    accessorKey: "players",
    header: "PLAYERS",
  },
];

// Define TypeScript type for the table
export type GoldNetworkCommissionData = {
  partner: string;
  pendingCommission: number | string;
  status: string; // Use enum for strict typing
  allTime: number | string;
  summary: number | string;
};

// Define column structure for the table
export const goldnetworkCommissionColumns: ColumnDef<GoldNetworkCommissionData>[] =
  [
    {
      accessorKey: "partner",
      header: "PARTNER",
    },
    {
      accessorKey: "pendingCommission",
      header: "PENDING COMMISSION ",
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => <span>{row.original.status}</span>, // Ensures enum values are displayed correctly
    },
    {
      accessorKey: "allTime",
      header: "ALL TIME",
    },
    {
      accessorKey: "summary",
      header: "SUMMARY",
    },
  ];
