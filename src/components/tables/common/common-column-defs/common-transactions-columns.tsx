"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the data structure for the Reports List table
export type TransactionsReportsListData = {
  id: number;
  fromDate: string;
  toDate: string;
  status: string;
  action: string;
};

// Reports List Table Columns
export const transactionsReportsListColumns: ColumnDef<TransactionsReportsListData>[] =
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
const handleDownload = (report: TransactionsReportsListData) => {
  console.log("Downloading report:", report);
};
