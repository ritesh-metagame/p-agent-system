import React from "react";

import { goldAllCommissionCutoffidStatusColumns } from "../../tables/gold/commission-release/all-commissions-cutoff-columns";

import type { GoldAllCommissionCutoffIDStatusData } from "../../tables/gold/commission-release/all-commissions-cutoff-columns";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";
import Data from "./gold.json";

//

type Props = {};

// Dummy data for GoldCommissionRecentCutoffData
const goldAllCommissionCutoffIDStatusData: GoldAllCommissionCutoffIDStatusData[] =
  Data.goldAllCommissionCutoffIDStatusData || [];

export default function OperatorAllCommissionCutoff({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div className="mb-10">
          <TypographyH2 className="mb-4">All Commission Cutoff</TypographyH2>

          <DataTable
            columns={goldAllCommissionCutoffidStatusColumns}
            // data={goldCommissionRecentCutoffData}
            data={goldAllCommissionCutoffIDStatusData}
            columnWidths={["250px", "250px", "250px"]}
          />
        </div>
      </div>
    </div>
  );
}
