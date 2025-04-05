"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

// Define the shape of the data for the table.
export type SettlementReportData = {
  id: number;
  start: string;
  end: string;
  status: string;
  action: string;
};

// Column definitions for the Reports List table
export const settlementListColumns: ColumnDef<SettlementReportData>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "start",
    header: "START",
  },
  {
    accessorKey: "end",
    header: "END",
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
        DOWNLOAD
      </Button>
    ),
  },
];

// Function to handle download action
const handleDownload = (report: SettlementReportData) => {
  console.log("Downloading report:", report);
};
