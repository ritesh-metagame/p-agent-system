"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the shape of the data for Network Stats
export type NetworkStatsData = {
  ppApproved: number | string;
  ppPending: number | string;
  gpApproved: number | string;
  gpPending: number | string;
  players: number | string;
};

export const networkStatsColumns: ColumnDef<NetworkStatsData>[] = [
  {
    accessorKey: "ppApproved",
    header: "PP APPROVED",
  },
  {
    accessorKey: "ppPending",
    header: "PP PENDING",
  },
  {
    accessorKey: "gpApproved",
    header: "GP APPROVED",
  },
  {
    accessorKey: "gpPending",
    header: "GP PENDING",
  },
  {
    accessorKey: "players",
    header: "PLAYERS",
  },
];

// Define the shape of the data for Network Commission
export type NetworkCommissionData = {
  platinumPartner: string;
  pendingCommission: number | string;
  status: string;
  allTime: number | string;
  total: number | string;
};

export const networkCommissionColumns: ColumnDef<NetworkCommissionData>[] = [
  {
    accessorKey: "platinumPartner",
    header: "PLATINUM PARTNER",
  },
  {
    accessorKey: "pendingCommission",
    header: "PENDING COMMISSION AS OF AVAILABLE CUTOFF PERIOD",
  },
  {
    accessorKey: "status",
    header: "STATUS",
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
