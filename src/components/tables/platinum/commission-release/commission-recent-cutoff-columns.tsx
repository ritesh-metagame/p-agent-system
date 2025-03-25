"use client";
import { ColumnDef } from "@tanstack/react-table";

/**
 * Platinum Partner Table
 */
export type PlatinumPartnerData = {
  platinumPartner: string;
  totalNetworkBets?: string;
  totalNetworkWinnings?: string;
  totalNetworkGGR?: string;
  totalNetworkGrossCommissions?: string;
  totalNetworkDeductions?: string;
  totalNetCommissions?: string;
  partnerBreakdown?: string;
  releaseCommissions?: string;
};

export const platinumPartnerColumns: ColumnDef<PlatinumPartnerData>[] = [
  { accessorKey: "platinumPartner", header: "PLATINUM PARTNER" },
  { accessorKey: "totalNetworkBets", header: "TOTAL NETWORK BETS" },
  { accessorKey: "totalNetworkWinnings", header: "TOTAL NETWORK WINNINGS" },
  { accessorKey: "totalNetworkGGR", header: "TOTAL NETWORK GGR" },
  {
    accessorKey: "totalNetworkGrossCommissions",
    header: "TOTAL NETWORK GROSS COMMISSIONS",
  },
  {
    accessorKey: "totalNetworkDeductions",
    header:
      "TOTAL NETWORK DEDUCTIONS (Payment Gateway Fee Deductions from GP Commissions)",
  },
  { accessorKey: "totalNetCommissions", header: "TOTAL NET COMMISSIONS" },
  { accessorKey: "partnerBreakdown", header: "PARTNER BREAKDOWN" },
  { accessorKey: "releaseCommissions", header: "RELEASE COMMISSIONS" },
];

/**
 * Export tables
 */
export const tableColumns = {
  platinumPartnerColumns,
};
