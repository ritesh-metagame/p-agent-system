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
