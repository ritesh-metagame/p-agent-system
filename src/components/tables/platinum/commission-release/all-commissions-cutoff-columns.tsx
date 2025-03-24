"use client";

import { ColumnDef } from "@tanstack/react-table";

export type IDStatusActionData = {
  id: string;
  cutoffPeriod?: string;
  status: string;
  action?: string;
};

export const idStatusActionColumns: ColumnDef<IDStatusActionData>[] = [
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
  },
  {
    accessorKey: "action",
    header: "ACTION",
    cell: ({ row }) =>
      row.original.action ? (
        <button style={{ backgroundColor: "yellow" }}>
          {row.original.action}
        </button>
      ) : (
        "-"
      ),
  },
];
