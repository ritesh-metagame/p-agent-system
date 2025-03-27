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

// Define the data structure for the Settlement table
export type SuperAdiminAllCommissionCutoffsData = {
  id: string;
  cutoffPeriod: string;
  amount: number | string;
  status: string;
  bank: string;
  refId: string;
  dateSettled: string;
};

// Settlement Table Columns
export const superAdminAllCommissionCutoffsColumns: ColumnDef<SuperAdiminAllCommissionCutoffsData>[] =
  [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "cutoffPeriod",
      header: "CUTOFF PERIOD",
    },
    {
      accessorKey: "amount",
      header: "AMOUNT",
    },
    {
      accessorKey: "status",
      header: "STATUS",
    },
    {
      id: "action",
      header: "ACTION",
      cell: ({ row }) =>
        row.original.status === "PENDING" ? (
          <Dialog>
            <DialogTrigger>
              <Button className="bg-green-900">Release Commission</Button>
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
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "bank",
      header: "BANK",
    },
    {
      accessorKey: "refId",
      header: "REF ID",
    },
    {
      accessorKey: "dateSettled",
      header: "DATE SETTLED",
    },
  ];

// Dummy data for the Settlement table
export const superAdminSettlementDummyData: SuperAdiminAllCommissionCutoffsData[] =
  [
    {
      id: "1",
      cutoffPeriod: "2023-09-01 to 2023-09-15",
      amount: "5000",
      status: "PENDING",

      bank: "Bank of America",
      refId: "REF12345",
      dateSettled: "-",
    },
    {
      id: "2",
      cutoffPeriod: "2023-08-16 to 2023-08-31",
      amount: "7500",
      status: "SETTLED",

      bank: "Chase Bank",
      refId: "REF67890",
      dateSettled: "2023-09-05",
    },
    {
      id: "3",
      cutoffPeriod: "2023-08-01 to 2023-08-15",
      amount: "6000",
      status: "PENDING",

      bank: "Wells Fargo",
      refId: "REF11223",
      dateSettled: "-",
    },
  ];
