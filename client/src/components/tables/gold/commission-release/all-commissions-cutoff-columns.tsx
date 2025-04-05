"use client";

import { ColumnDef } from "@tanstack/react-table";

// export enum Status {
//   Released = "RELEASED",
//   Pending = "PENDING",
// }

export type GoldAllCommissionCutoffIDStatusData = {
  id: string;
  cutoffPeriod?: string;
  status: string;
};

export const goldAllCommissionCutoffidStatusColumns: ColumnDef<GoldAllCommissionCutoffIDStatusData>[] =
  [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "cutoffPeriod",
      header: "CUTOFF PERIOD",
    },
    {
      accessorKey: "status",
      header: "STATUS",
      // cell: ({ row }) => <span>{row.original.status}</span>,
    },
  ];
