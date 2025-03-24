import { ColumnDef } from "@tanstack/react-table";

/**
 * Network Stats Table
 */
export type NetworkStatsData = {
  gpApproved: number | string;
  gpPending: number | string;
  players: number | string;
};

export const networkStatsColumns: ColumnDef<NetworkStatsData>[] = [
  { accessorKey: "gpApproved", header: "GP APPROVED" },
  { accessorKey: "gpPending", header: "GP PENDING" },
  { accessorKey: "players", header: "PLAYERS" },
];

/**
 * Network Commission Table
 */
export type NetworkCommissionData = {
  partner: string;
  pendingCommission: number | string;
  status: string;
  allTime: number | string;
  total: number | string;
};

export const networkCommissionColumns: ColumnDef<NetworkCommissionData>[] = [
  { accessorKey: "partner", header: "PARTNER" },
  {
    accessorKey: "pendingCommission",
    header: "PENDING COMMISSION AS OF AVAILABLE CUTOFF PERIOD",
  },
  { accessorKey: "status", header: "STATUS" },
  { accessorKey: "allTime", header: "ALL TIME" },
  { accessorKey: "total", header: "TOTAL" },
];

/**
 * Export tables
 */
export const tableColumns = {
  networkStatsColumns,
  networkCommissionColumns,
};
