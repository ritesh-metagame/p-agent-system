"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the data structure for the Operator Network table
export type OperatorNetworkData = {
  network: string;
  name: string;
  totalBets: number | string;
  totalWinnings: number | string;
  totalGGR: number | string;
  totalGrossCommissions: number | string;
  totalDeductions: number | string;
  totalNetCommissions: number | string;
};

// Operator Network Table Columns
export const operatorNetworkColumns: ColumnDef<OperatorNetworkData>[] = [
  {
    accessorKey: "network",
    header: "Network",
    cell: ({ row }) => row.original.network || "Operator",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "totalBets",
    header: "TOTAL NETWORK BETS",
  },
  {
    accessorKey: "totalWinnings",
    header: "TOTAL NETWORK WINNINGS",
  },
  {
    accessorKey: "totalGGR",
    header: "TOTAL NETWORK GGR",
  },
  {
    accessorKey: "totalGrossCommissions",
    header: "TOTAL NETWORK GROSS COMMISSIONS",
  },
  {
    accessorKey: "totalDeductions",
    header:
      "TOTAL NETWORK DEDUCTIONS (Payment Gateway Fee Deductions from GP Commissions)",
  },
  {
    accessorKey: "totalNetCommissions",
    header: "TOTAL NET COMMISSIONS",
  },
];

// Define the data structure for the Platinum Partner table
export type PlatinumPartnerData = {
  network: string;
  name: string;
  totalBets: number | string;
  totalWinnings: number | string;
  totalGGR: number | string;
  totalGrossCommissions: number | string;
  totalDeductions: number | string;
  totalNetCommissions: number | string;
};

// Platinum Partner Table Columns
export const platinumPartnerColumns: ColumnDef<PlatinumPartnerData>[] = [
  {
    accessorKey: "network",
    header: "Network",
    cell: ({ row }) => row.original.network || "Platinum",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "totalBets",
    header: "TOTAL BETS",
  },
  {
    accessorKey: "totalWinnings",
    header: "TOTAL WINNINGS",
  },
  {
    accessorKey: "totalGGR",
    header: "TOTAL GGR",
  },
  {
    accessorKey: "totalGrossCommissions",
    header: "TOTAL GROSS COMMISSIONS",
  },
  {
    accessorKey: "totalDeductions",
    header:
      "TOTAL DEDUCTIONS (Payment Gateway Fee Deductions from GP Commissions)",
  },
  {
    accessorKey: "totalNetCommissions",
    header: "TOTAL NET COMMISSIONS",
  },
];

// Define the data structure for the Golden Partner table
export type GoldenPartnerData = {
  network: string;
  name: string;
  totalBets: number | string;
  totalWinnings: number | string;
  totalGGR: number | string;
  totalGrossCommissions: number | string;
  totalDeductions: number | string;
  totalNetCommissions: number | string;
};

// Golden Partner Table Columns
export const goldenPartnerColumns: ColumnDef<GoldenPartnerData>[] = [
  {
    accessorKey: "network",
    header: "Network",
    cell: ({ row }) => row.original.network || "Golden",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "totalBets",
    header: "TOTAL BETS",
  },
  {
    accessorKey: "totalWinnings",
    header: "TOTAL WINNINGS",
  },
  {
    accessorKey: "totalGGR",
    header: "TOTAL GGR",
  },
  {
    accessorKey: "totalGrossCommissions",
    header: "TOTAL GROSS COMMISSIONS",
  },
  {
    accessorKey: "totalDeductions",
    header:
      "TOTAL DEDUCTIONS (Payment Gateway Fee Deductions from GP Commissions)",
  },
  {
    accessorKey: "totalNetCommissions",
    header: "TOTAL NET COMMISSIONS",
  },
];
