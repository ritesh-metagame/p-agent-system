"use client";

import { ColumnDef } from "@tanstack/react-table";

// Updated type for commission data
export type ManageSite = {
  id: string; // OPERATOR, PLATINUM, GOLDEN
  name: string;
  url: string;
  description: string;
  users: string;
  createdAt: Date;
  updatedAt: Date; // Released all time values
};

export const manageSitesColumn: ColumnDef<ManageSite>[] = [
  {
    accessorKey: "id",
    header: "ID", // Empty header for first column
    cell: ({ row }) => <span className="font-bold">{row.getValue("id")}</span>,
  },
  {
    accessorKey: "name",
    header: "SITE NAME",
    cell: ({ row }) => {
      const value = row.getValue("name");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      const value = row.getValue("url");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
  {
    accessorKey: "description",
    header: "DESCRIPTION",
    cell: ({ row }) => {
      const value = row.getValue("description");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
  {
    accessorKey: "users",
    header: "USERS",
    cell: ({ row }) => {
      const value = row.getValue("users");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
  {
    accessorKey: "createdAt",
    header: "CREATED AT",
    cell: ({ row }) => {
      const value = row.getValue("createdAt");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "UPDATED AT",
    cell: ({ row }) => {
      const value = row.getValue("updatedAt");
      return typeof value === "number" ? value.toLocaleString() : value;
    },
  },
];
