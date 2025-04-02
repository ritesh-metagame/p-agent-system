"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the shape of the data for Partners
export type OperatorPartnersData = {
  platinumPartner: string;
  totalNetworkBets: number | string;
  totalNetworkWinnings: number | string;
  totalNetworkGGR: number | string;
  totalNetworkGrossCommissions: number | string;
  totalNetworkDeductions: number | string;
  totalNetCommissions: number | string;
  partnerBreakdown: string;
  releaseCommissions: string;
};

export const operatorpartnersColumns: ColumnDef<OperatorPartnersData>[] = [
  {
    accessorKey: "platinumPartner",
    header: "PLATINUM PARTNER",
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
    accessorKey: "totalNetworkDeductions",
    header:
      "TOTAL NETWORK DEDUCTIONS (Payment Gateway Fee Deductions from GP Commissions)",
  },
  {
    accessorKey: "totalNetCommissions",
    header: "TOTAL NET COMMISSIONS",
  },
  {
    accessorKey: "partnerBreakdown",
    header: "PARTNER BREAKDOWN",
    cell: ({ row }) => (
      <button className="bg-blue-500 text-white px-3 py-1 rounded">VIEW</button>
    ),
  },
  {
    accessorKey: "releaseCommissions",
    header: "RELEASE COMMISSIONS",
    cell: ({ row }) => (
      <button className="bg-gray-300 text-black px-3 py-1 rounded">
        RELEASE COMMS
      </button>
    ),
  },
];
