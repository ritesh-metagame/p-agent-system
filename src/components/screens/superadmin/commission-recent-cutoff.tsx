import { DataTable } from "@/components/tables/data-table";
// import { commissionPerCutoffColumns } from "@/components/tables/superadmin/commission-release/commission-per-cutoff-columns";
import { commissionRecentCutoffColumns } from "@/components/tables/superadmin/commission-release/commission-recent-cutoff-columns";
import type { CommissionRecentCutoffData } from "@/components/tables/superadmin/commission-release/commission-recent-cutoff-columns";
import { commissionOverviewColumns } from "@/components/tables/superadmin/general/dashboard-columns";
import { TypographyH2 } from "@/components/ui/typographyh2";
import { TypographyH4 } from "@/components/ui/typographyh4";
import React from "react";
import Data from "./superAdmin.json";

type Props = {};
const commissionRecentCutoffData: CommissionRecentCutoffData[] =
  Data.commissionRecentCutoffData || [];

export default function CommissionRecentCutoff({}: Props) {
  return (
    <div>
      <div className="mb-10">
        <TypographyH2 className="mb-2">Operators</TypographyH2>
        <TypographyH4 className="mb-4">
          Cutoff period available for settlement:{" "}
          <span className="text-grey-600">Feb 1 - Feb 15, 2025</span>
        </TypographyH4>
        <div className="mb-4">
          <DataTable
            columns={commissionRecentCutoffColumns}
            data={commissionRecentCutoffData}
            columnWidths={[
              "150px",
              "150px",
              "150px",
              "100px",
              "200px",
              "150px",
              "150px",
              "150px",
              "250px",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
