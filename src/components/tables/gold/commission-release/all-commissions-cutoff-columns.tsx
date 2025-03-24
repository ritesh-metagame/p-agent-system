"use client";

import { ColumnDef } from "@tanstack/react-table";

export type IDStatusData = {
  id: string;
  cutoffPeriod?: string;
  status: string;
};

export const idStatusColumns: ColumnDef<IDStatusData>[] = [
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
];
