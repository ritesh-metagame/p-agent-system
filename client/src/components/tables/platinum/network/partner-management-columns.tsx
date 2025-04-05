import { ColumnDef } from "@tanstack/react-table";

/**
 * Network Stats Table
 */
export type PlatinumNetworkStatsData = {
  gpApproved: number | string;
  gpPending: number | string;
  players: number | string;
};

export const platinumnetworkStatsColumns: ColumnDef<PlatinumNetworkStatsData>[] =
  [
    { accessorKey: "gpApproved", header: "GP APPROVED" },
    { accessorKey: "gpPending", header: "GP PENDING" },
    { accessorKey: "players", header: "PLAYERS" },
  ];

/**
 * Network Commission Table
 */
export type PlatinumNetworkCommissionData = {
  partner: string;
  pendingCommission: number | string;
  status: string;
  allTime: number | string;
  summary: number | string;
};

export const platinumnetworkCommissionColumns: ColumnDef<PlatinumNetworkCommissionData>[] =
  [
    { accessorKey: "partner", header: "PARTNER" },
    {
      accessorKey: "pendingCommission",
      header: "PENDING COMMISSION",
    },
    { accessorKey: "status", header: "STATUS" },
    { accessorKey: "allTime", header: "ALL TIME" },
    { accessorKey: "summary", header: "SUMMARY" },
  ];

/**
 * Export tables
 */
export const tableColumns = {
  platinumnetworkStatsColumns,
  platinumnetworkCommissionColumns,
};
