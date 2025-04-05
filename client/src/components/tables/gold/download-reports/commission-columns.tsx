"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the shape of the data for the table.
export type GoldCommissionReportData = {
  id: number;
  fromDate: string;
  toDate: string;
  status: string;
  action: string;
};

// Column definitions for the Reports List table
export const goldCommissionreportsListColumns: ColumnDef<GoldCommissionReportData>[] = [
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
const handleDownload = (report: GoldCommissionReportData) => {
  console.log("Downloading report:", report);
};
