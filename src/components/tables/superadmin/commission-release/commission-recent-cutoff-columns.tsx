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
      header: "Network",
    },
    {
      accessorKey: "totalNetworkBets",
      header: "Total Bets",
    },
    {
      accessorKey: "totalNetworkWinnings",
      header: "Total Winnings",
    },
    {
      accessorKey: "totalNetworkGGR",
      header: "GGR",
    },
    {
      accessorKey: "totalNetworkGrossCommissions",
      header: "Gross Commissions",
    },
    {
      accessorKey: "totalNetworkDeductions",
      header: "Total Deductions",
    },
    {
      accessorKey: "totalNetCommissions",
      header: "Net Commissions",
    },
    {
      accessorKey: "partnerBreakdown",
      header: "Partner Breakdown",
      cell: () => <button className="view-button">View</button>,
    },
    {
      accessorKey: "releaseCommissions",
      header: "Release Commissions",
      cell: () => {
        return (
          <Dialog>
            <DialogTrigger>
              <Button>Release Commission</Button>
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
