import { DataTable } from "@/components/tables/data-table";
import { superAdminAllCommissionCutoffsColumns } from "@/components/tables/superadmin/commission-release/all-commissions-cutoff-columns";
import type { SuperAdiminAllCommissionCutoffsData } from "@/components/tables/superadmin/commission-release/all-commissions-cutoff-columns";
import { superAdminReportsListColumns } from "@/components/tables/superadmin/download-reports/commission-columns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypographyH2 } from "@/components/ui/typographyh2";
import React from "react";
import Data from "./superAdmin.json";
import { SuperAdminSettlementReportData } from "@/components/tables/superadmin/download-reports/settlement-history-columns";
const superAdminSettlementDummyData: SuperAdiminAllCommissionCutoffsData[] =
  Data.superAdminSettlementDummyData || [];

type Props = {};

export default function AllCommissionCutoffs({}: Props) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-10">
        <TypographyH2 className="">All Commission Cutoffs</TypographyH2>
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Month</SelectLabel>
                <SelectItem value="jan">January</SelectItem>
                <SelectItem value="feb">February</SelectItem>
                <SelectItem value="mar">March</SelectItem>
                <SelectItem value="apr">April</SelectItem>
                <SelectItem value="may">May</SelectItem>
                <SelectItem value="jun">June</SelectItem>
                <SelectItem value="jul">July</SelectItem>
                <SelectItem value="aug">August</SelectItem>
                <SelectItem value="sep">September</SelectItem>
                <SelectItem value="oct">October</SelectItem>
                <SelectItem value="nov">November</SelectItem>
                <SelectItem value="dec">December</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Year</SelectLabel>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button className="bg-table-header">Search</Button>
        </div>
      </div>
      <DataTable
        columns={superAdminAllCommissionCutoffsColumns}
        data={superAdminSettlementDummyData}
        columnWidths={[
          "100px",
          "200px",
          "200px",
          "200px",
          "200px",
          "200px",
          "200px",
        ]}
      />
    </div>
  );
}
