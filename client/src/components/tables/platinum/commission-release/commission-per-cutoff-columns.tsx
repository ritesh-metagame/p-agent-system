"use client";

import { ColumnDef } from "@tanstack/react-table";

// TODO : gotta add the default values for the column Network

// Define the shape of the data for the table.
export type PlatinumCommissionPerCutoffData = {
  network: string;
  name: string;
  totalNetworkBets: number | string;
  totalNetworkWinnings: number | string;
  totalNetworkGGR: number | string;
  totalNetworkGrossCommissions: number | string;
  paymentGatewayFeeDeductions: number | string;
  totalNetCommissions: number | string;
};

export const platinumcommissionPerCutoffColumns: ColumnDef<PlatinumCommissionPerCutoffData>[] =
  [
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
      accessorKey: "totalNetworkBets",
      header: "TOTAL NETWORK BETS",
    },
    {
      accessorKey: "totalNetworkWinnings",
      header: "TOTAL NETWORK WINNINGS",
    },
    {
      accessorKey: "totalNetworkGGR",
      header: "TOTAL NETWORK GGR",
    },
    {
      accessorKey: "totalNetworkGrossCommissions",
      header: "TOTAL NETWORK GROSS COMMISSIONS",
    },
    {
      accessorKey: "paymentGatewayFeeDeductions",
      header:
        "TOTAL NETWORK DEDUCTIONS Payment Gateway Fee Deductions from GP Commissions",
    },
    {
      accessorKey: "totalNetCommissions",
      header: "TOTAL NET COMMISSIONS",
    },
  ];

export type PlatinumPartnerCommissionData = {
  network: string;
  name: string;
  totalBets: number | string;
  totalWinnings: number | string;
  totalGGR: number | string;
  totalGrossCommissions: number | string;
  paymentGatewayFeeDeductions: number | string;
  totalNetCommissions: number | string;
};

export const platinumpartnerCommissionColumns: ColumnDef<PlatinumPartnerCommissionData>[] = [
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
    accessorKey: "paymentGatewayFeeDeductions",
    header:
      "TOTAL DEDUCTIONS Payment Gateway Fee Deductions from GP Commissions",
  },
  {
    accessorKey: "totalNetCommissions",
    header: "TOTAL NET COMMISSIONS",
  },
];
