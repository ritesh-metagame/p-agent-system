"use client";

import { ColumnDef } from "@tanstack/react-table";

//!enum needs approval

// Define enum for Status
export enum CommissionStatus {
  Released = "RELEASED",
  Pending = "PENDING",
}

export type GoldNetworkStats = {
  players: string;
};

export const goldNetworkStatsColumns: ColumnDef<GoldNetworkStats>[] = [
  {
    accessorKey: "players",
    header: "Players",
  },
];

// Define TypeScript type for the table
export type GoldNetworkCommissionData = {
  partner: string;
  pendingCommission: number | string;
  status: CommissionStatus; // Use enum for strict typing
  allTime: number | string;
  total: number | string;
};

// Define column structure for the table
export const goldnetworkCommissionColumns: ColumnDef<GoldNetworkCommissionData>[] =
  [
    {
      accessorKey: "partner",
      header: "Partner",
    },
    {
      accessorKey: "pendingCommission",
      header: "PENDING COMMISSION AS OF AVAILABLE CUTOFF PERIOD",
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
      accessorKey: "total",
      header: "TOTAL",
    },
  ];
