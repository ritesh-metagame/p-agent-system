"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the shape of the data for the table.
export type ReportData = {
  id: number;
  fromDate: string;
  toDate: string;
  status: string;
  action: string;
};

// Column definitions for the Reports List table
export const reportsListColumns: ColumnDef<ReportData>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "fromDate",
    header: "FROM DATE",
  },
  {
    accessorKey: "toDate",
    header: "TO DATE",
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
const handleDownload = (report: ReportData) => {
  console.log("Downloading report:", report);
};
