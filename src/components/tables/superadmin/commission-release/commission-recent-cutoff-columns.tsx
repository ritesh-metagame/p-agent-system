"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the shape of the data for the table.
export type CommissionRecentCutoffData = {
  network: string;
  totalNetworkBets: number | string;
  totalNetworkWinnings: number | string;
  totalNetworkGGR: number | string;
  totalNetworkGrossCommissions: number | string;
  totalNetworkDeductions: number | string;
  totalNetCommissions: number | string;
};

// Define the columns for the table.
export const commissionRecentCutoffColumns: ColumnDef<CommissionRecentCutoffData>[] =
  [
    {
      accessorKey: "network",
      header: "Network",
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
    {
      accessorKey: "partnerBreakdown",
      header: "Partner Breakdown",
      cell: () => <button className="view-button">View</button>,
    },
    {
      accessorKey: "releaseCommissions",
      header: "Release Commissions",
      cell: () => <button className="release-button">Release Comms</button>,
    },
  ];
