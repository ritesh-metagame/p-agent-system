"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      header: "NETWORK",
    },
    {
      accessorKey: "totalNetworkBets",
      header: "TOTAL BETS",
    },
    {
      accessorKey: "totalNetworkWinnings",
      header: "TOTAL WINNINGS",
    },
    {
      accessorKey: "totalNetworkGGR",
      header: "GGR",
    },
    {
      accessorKey: "totalNetworkGrossCommissions",
      header: "GROSS COMMISSIONS",
    },
    {
      accessorKey: "totalNetworkDeductions",
      header: "TOTAL DEDUCTIONS",
    },
    {
      accessorKey: "totalNetCommissions",
      header: "NET COMMISSIONS",
    },
    {
      accessorKey: "partnerBreakdown",
      header: "PARTNER BREAKDOWN",
      cell: () => (
        <Dialog>
          <DialogTrigger>
            <Button variant="orange">View</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Partner Breakdown</DialogTitle>
              <DialogDescription>Example</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      ),
    },
    {
      accessorKey: "releaseCommissions",
      header: "RELEASE COMMISSIONS",
      cell: () => {
        return (
          <Dialog>
            <DialogTrigger>
              <Button variant="green">Release Commission</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Release Commission</DialogTitle>
                <DialogDescription>
                  Release commissions for the selected network
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        );
      },
    },
  ];

// Dummy data for the table
export const commissionRecentCutoffData: CommissionRecentCutoffData[] = [
  {
    network: "Network A",
    totalNetworkBets: 10000,
    totalNetworkWinnings: 8000,
    totalNetworkGGR: 2000,
    totalNetworkGrossCommissions: 500,
    totalNetworkDeductions: 100,
    totalNetCommissions: 400,
  },
  {
    network: "Network B",
    totalNetworkBets: 20000,
    totalNetworkWinnings: 15000,
    totalNetworkGGR: 5000,
    totalNetworkGrossCommissions: 1200,
    totalNetworkDeductions: 300,
    totalNetCommissions: 900,
  },
  {
    network: "Network C",
    totalNetworkBets: 15000,
    totalNetworkWinnings: 12000,
    totalNetworkGGR: 3000,
    totalNetworkGrossCommissions: 800,
    totalNetworkDeductions: 200,
    totalNetCommissions: 600,
  },
];
