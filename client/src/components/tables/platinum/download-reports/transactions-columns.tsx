"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the data structure for the Reports List table
export type PlatTransactionReportsListData = {
  id: number;
  fromDate: string;
  toDate: string;
  status: string;
  action: string;
};

// Reports List Table Columns
export const platTransactionreportsListColumns: ColumnDef<PlatTransactionReportsListData>[] =
  [
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
      //below accessorKey is replaced by id
      id: "action",
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
const handleDownload = (report: PlatTransactionReportsListData) => {
  console.log("Downloading report:", report);
};
