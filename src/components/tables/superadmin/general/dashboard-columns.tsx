"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type NetworkStatistics = {
  id: string;
  approved: number | string;
  pending: number | string;
  declined: number | string;
};

export const networkStatisticsColumn: ColumnDef<NetworkStatistics>[] = [
  {
    accessorKey: "id",
    header: "",
  },
  {
    accessorKey: "approved",
    header: "Approved",
  },
  {
    accessorKey: "pending",
    header: "Pending",
  },
  {
    accessorKey: "declined",
    header: "Declined",
  },
];
