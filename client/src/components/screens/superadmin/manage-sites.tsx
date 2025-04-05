"use client";

import React, { useEffect, useState } from "react";
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
import { TypographyH2 } from "@/components/ui/typographyh2";
import { DataTable } from "@/components/tables/data-table";
import {
  ManageSite,
  manageSitesColumn,
} from "@/components/tables/superadmin/general/manage-sites-columns";

export default function SuperAdminManageSites() {
  const router = useRouter();
  const [sites, setSites] = useState<ManageSite | null>();

  useEffect(() => {
    const fetchSites = async () => {
      const res = await fetch("http://localhost:8080/api/v1/site", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        console.error("Error fetching sites:", res.statusText);
        return;
      }

      const data = await res.json();

      console.log("Fetched sites:", data.data);

      const sitesList = data.data.map((site: any) => ({
        id: site.id,
        name: site.name,
        url: site.url,
        description: site.description,
        users: site.users?.length ?? 0,
        createdAt: new Date(site.createdAt).toLocaleDateString(),
        updatedAt: new Date(site.updatedAt).toLocaleDateString(),
      }));

      setSites(sitesList);
    };

    fetchSites();
  }, []);

  console.log(sites);

  return (
    <div className="">
      <div className="flex items-center mb-4 gap-2">
        <TypographyH2 className="text-xl font-bold">Manage Sites</TypographyH2>
        <Link href="/create-site">
          <Button>Create Site</Button>
        </Link>
      </div>

      <DataTable columns={manageSitesColumn} data={(sites as any) ?? []} />
    </div>
  );
}
