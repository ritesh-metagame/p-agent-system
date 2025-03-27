"use client";

import { ColumnDef } from "@tanstack/react-table";

//!need to check with the excel sheet

// Define the shape of the data for the table.
export type GoldCommissionRecentCutoffData = {
  platinumPartner: string;
  totalNetworkBets: number | string;
  totalNetworkWinnings: number | string;
  totalNetworkGGR: number | string;
  totalNetworkGrossCommissions: number | string;
  totalNetworkDeductions: number | string;
  totalNetCommissions: number | string;
};

// Define the columns for the table.
export const goldcommissionRecentCutoffColumns: ColumnDef<GoldCommissionRecentCutoffData>[] =
  [
    {
      accessorKey: "platinumPartner",
      header: "Platinum Partner",
    },
    {
      accessorKey: "totalNetworkBets",
      header: "Total Network Bets",
    },
    {
      accessorKey: "totalNetworkWinnings",
      header: "Total Network Winnings",
    },
    {
      accessorKey: "totalNetworkGGR",
      header: "Total Network GGR",
    },
    {
      accessorKey: "totalNetworkGrossCommissions",
      header: "Total Network Gross Commissions",
    },
    {
      accessorKey: "totalNetworkDeductions",
      header: "Total Network Deductions",
    },
    {
      accessorKey: "totalNetCommissions",
      header: "Total Net Commissions",
    },
  ];
