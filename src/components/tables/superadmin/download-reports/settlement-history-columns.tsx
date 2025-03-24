"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the shape of the data for the table.
export type SuperAdminSettlementReportData = {
  id: number;
  start: string;
  end: string;
  status: string;
  action: string;
};

// Column definitions for the Reports List table
export const superAdminSettlementListColumns: ColumnDef<SuperAdminSettlementReportData>[] = [
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
      <button
        onClick={() => handleDownload(row.original)}
        className="btn-download"
      >
        DOWNLOAD
      </button>
    ),
  },
];

// Function to handle download action
const handleDownload = (report: SuperAdminSettlementReportData) => {
  console.log("Downloading report:", report);
};