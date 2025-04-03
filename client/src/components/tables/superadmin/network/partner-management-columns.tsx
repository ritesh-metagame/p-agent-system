"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";

// Define the shape of the data for the table.

export type Partners = {
  id: string;
  username: string;
  password: string;
  roleId: string;
  affiliateLink: string;
  firstName: string | null;
  lastName: string | null;
  mobileNumber: string | null;
  bankName: string | null;
  accountNumber: string | null;
  parentId: string;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
  commissions: any[]; // You might want to define a more specific type
  userSites: {
    userId: string;
    siteId: string;
    assignedAt: string;
  }[];
  children: any[]; // You might want to define a more specific type
};

export const partnerColumns: ColumnDef<Partners>[] = [
  {
    accessorKey: "username",
    header: "USERNAME",
  },
  {
    accessorKey: "role",
    header: "ROLE",
  },
  {
    accessorKey: "mobileNumber",
    header: "MOBILE NUMBER",
  },
  {
    accessorKey: "bankName",
    header: "BANK NAME",
  },
  {
    accessorKey: "accountNumber",
    header: "ACCOUNT NUMBER",
  },
  {
    accessorKey: "createdAt",
    header: "CREATED AT",
  },
];

export type PartnerManagementData = {
  operatorName: string;
  ppApproved: number | string;
  ppPending: number | string;
  gpApproved: number | string;
  gpPending: number | string;
  players: number | string;
  exportFile: string;
};

export const partnerManagementColumns: ColumnDef<PartnerManagementData>[] = [
  {
    accessorKey: "operatorName",
    header: "OPERATOR NAME",
    cell: ({ row }) => (
      <p className="font-medium">
        {row.original.operatorName || "ALL OPERATORS"}
      </p>
    ),
  },
  {
    accessorKey: "ppApproved",
    header: "PP APPROVED",
  },
  {
    accessorKey: "ppPending",
    header: "PP PENDING",
  },
  {
    accessorKey: "gpApproved",
    header: "GP APPROVED",
  },
  {
    accessorKey: "gpPending",
    header: "GP PENDING",
  },
  {
    accessorKey: "players",
    header: "PLAYERS",
  },
  {
    accessorKey: "exportFile",
    header: "EXPORT FILE",
    cell: ({ row }) => (
      <Button
        className="bg-green-800"
        onClick={() => handleExport(row.original)}
      >
        Export
      </Button>
    ),
  },
];

const handleExport = (record: PartnerManagementData) => {
  // Implement the export functionality here
  console.log("Exporting record:", record);
};

// Dummy data for NETWORK STATS
export const allNetworkStatsData: PartnerManagementData[] = [
  {
    operatorName: "ALL OPERATORS",
    ppApproved: "",
    ppPending: "",
    gpApproved: "",
    gpPending: "",
    players: "",
    exportFile: "",
  },
];

export const operatorWiseNetworkStatsData: PartnerManagementData[] = [
  {
    operatorName: "ETA-001",
    ppApproved: "",
    ppPending: "",
    gpApproved: "",
    gpPending: "",
    players: "",
    exportFile: "",
  },

  {
    operatorName: "ETA-002",
    ppApproved: "",
    ppPending: "",
    gpApproved: "",
    gpPending: "",
    players: "",
    exportFile: "",
  },
];

export type NetworkCommissionData = {
  operatorName: string;
  pendingCommission: number | string;
  status: string;
  allTime: number | string;
  total: number | string;
};

export const networkCommissionColumns: ColumnDef<NetworkCommissionData>[] = [
  {
    accessorKey: "operatorName",
    header: "OPERATOR NAME",
  },
  {
    accessorKey: "pendingCommission",
    header: "PENDING COMMISSION",
  },
  {
    accessorKey: "status",
    header: "STATUS",
  },
  {
    accessorKey: "allTime",
    header: "ALL TIME",
  },
  {
    accessorKey: "total",
    header: "TOTAL",
  },
];

// Dummy data for NETWORK COMMISSION
export const networkCommissionData: NetworkCommissionData[] = [
  {
    operatorName: "ETA-001",
    pendingCommission: "10,000",
    status: "RELEASED",
    allTime: "1,00,000",
    total: "1,10,000",
  },
  {
    operatorName: "ETA-002",
    pendingCommission: "5,000",
    status: "PENDING",
    allTime: "10,000",
    total: "15,000",
  },
];
