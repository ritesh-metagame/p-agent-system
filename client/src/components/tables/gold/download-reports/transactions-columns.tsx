"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the data structure for the Reports List table
export type GoldTransactionReportsListData = {
  id: number;
  fromDate: string;
  toDate: string;
  status: string;
  action: string;
};

// Reports List Table Columns
export const goldTransactionReportsListColumns: ColumnDef<GoldTransactionReportsListData>[] =
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
      cell: () => (
        <button
          style={{
            backgroundColor: "#E87524",
            color: "white",
            padding: "6px 12px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          DOWNLOAD
        </button>
      ),
    },
  ];
