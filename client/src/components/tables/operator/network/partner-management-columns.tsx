"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the shape of the data for Network Stats
export type OperatorNetworkStatsData = {
  ppApproved: number | string;
  ppPending: number | string;
  gpApproved: number | string;
  gpPending: number | string;
  players: number | string;
};

export const operatornetworkStatsColumns: ColumnDef<OperatorNetworkStatsData>[] = [
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
export type OperatorNetworkCommissionData = {
  platinumPartner: string;
  pendingCommissionAsOfAvailable: number | string;
  status: string;
  allTime: number | string;
  total: number | string;
};

export const operatornetworkCommissionColumns: ColumnDef<OperatorNetworkCommissionData>[] = [
  {
    accessorKey: "platinumPartner",
    header: "PLATINUM PARTNER",
  },
  {
    accessorKey: "pendingCommissionAsOfAvailable",
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
