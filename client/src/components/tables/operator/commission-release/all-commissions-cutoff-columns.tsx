"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

// Define the data structure for the Settlement table
export type OperatorAllCommissionCutoffData = {
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
export const operatorAllCommissionCutoffColumns: ColumnDef<OperatorAllCommissionCutoffData>[] =
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
      cell: ({ row }) => (
        <Button
          className="bg-[#5D94B4] text-white"
          onClick={() => handleDownload(row.original)}
        >
          RELEASE COMMISSION
        </Button>
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
// Function to handle download action
const handleDownload = (report: OperatorAllCommissionCutoffData) => {
  console.log("Downloading report:", report);
};
