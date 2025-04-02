// "use client";

// import { ColumnDef } from "@tanstack/react-table";

// // Define the shape of the data for the table.
// export type GoldCommissionPerCutoffData = {
//   network: string;
//   name: string;
//   totalNetworkBets: number | string;
//   totalNetworkWinnings: number | string;
//   totalNetworkGGR: number | string;
//   totalNetworkGrossCommissions: number | string;
//   paymentGatewayFeeDeductions: number | string;
//   totalNetCommissions: number | string;
// };

// export const goldcommissionPerCutoffColumns: ColumnDef<GoldCommissionPerCutoffData>[] =
//   [
//     {
//       accessorKey: "network",
//       header: "Network",
//     },
//     {
//       accessorKey: "name",
//       header: "Name",
//     },
//     {
//       accessorKey: "totalNetworkBets",
//       header: "TOTAL NETWORK BETS",
//     },
//     {
//       accessorKey: "totalNetworkWinnings",
//       header: "TOTAL NETWORK WINNINGS",
//     },
//     {
//       accessorKey: "totalNetworkGGR",
//       header: "TOTAL NETWORK GGR",
//     },
//     {
//       accessorKey: "totalNetworkGrossCommissions",
//       header: "TOTAL NETWORK GROSS COMMISSIONS",
//     },
//     {
//       accessorKey: "paymentGatewayFeeDeductions",
//       header:
//         "TOTAL NETWORK DEDUCTIONS Payment Gateway Fee Deductions from GP Commissions",
//     },
//     {
//       accessorKey: "totalNetCommissions",
//       header: "TOTAL NET COMMISSIONS",
//     },
//   ];

// export type GoldPartnerCommissionData = {
//   network: string;
//   name: string;
//   totalBets: number | string;
//   totalWinnings: number | string;
//   totalGGR: number | string;
//   totalGrossCommissions: number | string;
//   paymentGatewayFeeDeductions: number | string;
//   totalNetCommissions: number | string;
// };

// export const goldpartnerCommissionColumns: ColumnDef<GoldPartnerCommissionData>[] = [
//   {
//     accessorKey: "network",
//     header: "Network",
//   },
//   {
//     accessorKey: "name",
//     header: "Name",
//   },
//   {
//     accessorKey: "totalBets",
//     header: "TOTAL BETS",
//   },
//   {
//     accessorKey: "totalWinnings",
//     header: "TOTAL WINNINGS",
//   },
//   {
//     accessorKey: "totalGGR",
//     header: "TOTAL GGR",
//   },
//   {
//     accessorKey: "totalGrossCommissions",
//     header: "TOTAL GROSS COMMISSIONS",
//   },
//   {
//     accessorKey: "paymentGatewayFeeDeductions",
//     header:
//       "TOTAL DEDUCTIONS Payment Gateway Fee Deductions from GP Commissions",
//   },
//   {
//     accessorKey: "totalNetCommissions",
//     header: "TOTAL NET COMMISSIONS",
//   },
// ];
