"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the shape of the data for the table.
export type GoldCommissionRecentCutoffData = {
  platinumPartner: string;
  totalBets: number | string;
  totalWinnings: number | string;
  gGR: number | string;
  grossCommissions: number | string;
  totalDeductions: number | string;
  netCommissions: number | string;
};

// Define the columns for the table.
export const goldcommissionRecentCutoffColumns: ColumnDef<GoldCommissionRecentCutoffData>[] =
  [
    {
      accessorKey: "platinumPartner",
      header: "PLATINUM PARTNER",
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
      accessorKey: "gGR",
      header: "GGR",
    },
    {
      accessorKey: "grossCommissions",
      header: "GROSS COMMISSIONS",
    },
    {
      accessorKey: "totalDeductions",
      header: "TOTAL DEDUCTIONS",
    },
    {
      accessorKey: "netCommissions",
      header: "NET COMMISSIONS",
    },
  ];
