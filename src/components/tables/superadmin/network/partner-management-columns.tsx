"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the shape of the data for the table.
export type PartnerManagementData = {
  operatorName: string;
  ppApproved: number | string;
  ppPending: number | string;
  gpApproved: number | string;
  gpPending: number | string;
  players: number | string;
  exportFile: string;
};

export const partnerManagementColumns: ColumnDef<PartnerManagementData>[] = [
  {
    accessorKey: "operatorName",
    header: "OPERATOR NAME",
    cell: ({ row }) => row.original.operatorName || "ALL OPERATORS",
  },
  {
    accessorKey: "ppApproved",
    header: "PP APPROVED",
  },
  {
    accessorKey: "ppPending",
    header: "PP PENDING",
  },
  {
    accessorKey: "gpApproved",
    header: "GP APPROVED",
  },
  {
    accessorKey: "gpPending",
    header: "GP PENDING",
  },
  {
    accessorKey: "players",
    header: "PLAYERS",
  },
  {
    accessorKey: "exportFile",
    header: "EXPORT FILE",
    cell: ({ row }) => (
      <button onClick={() => handleExport(row.original)}>Export</button>
    ),
  },
];

const handleExport = (record: PartnerManagementData) => {
  // Implement the export functionality here
  console.log("Exporting record:", record);
};

export type NetworkCommissionData = {
  operatorName: string;
  pendingCommission: number | string;
  status: string;
  allTime: number | string;
  total: number | string;
};

export const networkCommissionColumns: ColumnDef<NetworkCommissionData>[] = [
  {
    accessorKey: "operatorName",
    header: "OPERATOR NAME",
  },
  {
    accessorKey: "pendingCommission",
    header: "PENDING COMMISSION AS OF AVAILABLE CUTOFF PERIOD",
  },
  {
    accessorKey: "status",
    header: "STATUS",
  },
  {
    accessorKey: "allTime",
    header: "ALL TIME",
  },
  {
    accessorKey: "total",
    header: "TOTAL",
  },
];
