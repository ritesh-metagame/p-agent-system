"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the data structure for the Settlement table
export type OperatorSettlementData = {
  id: string;
  cutoffPeriod: string;
  amount: number | string;
  status: string;
  action: string;
  bank: string;
  refId: string;
  dateSettled: string;
};

// Settlement Table Columns
export const operatorsettlementColumns: ColumnDef<OperatorSettlementData>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "cutoffPeriod",
    header: "CUTOFF PERIOD",
  },
  {
    accessorKey: "amount",
    header: "AMOUNT",
  },
  {
    accessorKey: "status",
    header: "STATUS",
  },
  {
    accessorKey: "action",
    header: "ACTION",
    cell: ({ row }) =>
      row.original.status === "PENDING" ? (
        <button style={{ backgroundColor: "yellow", padding: "5px" }}>
          RELEASE COMMS
        </button>
      ) : (
        "-"
      ),
  },
  {
    accessorKey: "bank",
    header: "BANK",
  },
  {
    accessorKey: "refId",
    header: "REF ID",
  },
  {
    accessorKey: "dateSettled",
    header: "DATE SETTLED",
  },
];
