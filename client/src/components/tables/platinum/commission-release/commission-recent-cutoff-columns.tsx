"use client";
import { ColumnDef } from "@tanstack/react-table";

/**
 * Platinum Partner Table
 */
export type PlatinumPartnerData = {
  platinumPartner: string;
  totalBets?: string;
  totalWinnings?: string;
  ggr?: string;
  grossCommissions?: string;
  totalDeductions?: string;
  netCommissions?: string;
  partnerBreakdown?: string;
  releaseCommissions?: string;
};

export const platinumPartnerColumns: ColumnDef<PlatinumPartnerData>[] = [
  { accessorKey: "platinumPartner", header: "PLATINUM PARTNER" },
  { accessorKey: "totalBets", header: "TOTAL  BETS" },
  { accessorKey: "totalWinnings", header: "TOTAL  WINNINGS" },
  { accessorKey: "ggr", header: "GGR" },
  {
    accessorKey: "grossCommissions",
    header: "GROSS COMMISSIONS",
  },
  {
    accessorKey: "totalDeductions",
    header: "TOTAL  DEDUCTIONS ",
  },
  { accessorKey: "netCommissions", header: "NET COMMISSIONS" },
  {
    //below accessor key is not required as it is just a button we are not rendering any data - source deepseek
    id: "partnerBreakdown",
    header: "PARTNER BREAKDOWN",
    cell: () => (
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-md">
        VIEW
      </button>
    ),
  },
  {
    id: "releaseCommissions",
    header: "RELEASE COMMISSIONS",
    cell: () => (
      <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded-md">
        RELEASE COMMISSION
      </button>
    ),
  },
];

/**
 * Export tables
 */
export const tableColumns = {
  platinumPartnerColumns,
};
