"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";

const sites = [
  { id: 1, name: "Site A", url: "/sites/site-a" },
  { id: 2, name: "Site B", url: "/sites/site-b" },
  { id: 3, name: "Site C", url: "/sites/site-c" },
];

export default function SuperAdminManageSites() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Manage Sites</h2>
        <Button onClick={() => router.push("/create-site")}>Create Site</Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map((site) => (
              <TableRow
                key={site.id}
                className="cursor-pointer hover:bg-gray-100 transition"
                onClick={() => router.push(site.url)}
              >
                <TableCell>{site.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
