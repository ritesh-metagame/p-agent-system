import React from "react";

import { operatorAllCommissionCutoffColumns } from "../../tables/operator/commission-release/all-commissions-cutoff-columns";

import type { OperatorAllCommissionCutoffData } from "../../tables/operator/commission-release/all-commissions-cutoff-columns";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";
import Data from "./operator.json";

//

type Props = {};

// Dummy data for GoldCommissionRecentCutoffData
const operatorAllCommissionCutoffData: OperatorAllCommissionCutoffData[] =
  Data.operatorAllCommissionCutoffData || [];

export default function OperatorAllCommissionCutoff({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div>
          <TypographyH2 className="mb-4">All Commission Cutoff</TypographyH2>

          <DataTable
            columns={operatorAllCommissionCutoffColumns}
            // data={goldCommissionRecentCutoffData}
            data={operatorAllCommissionCutoffData}
            columnWidths={[
              "250px",
              "250px",
              "250px",
              "250px",
              "250px",
              "250px",

              "250px",
              "250px",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
