import React from "react";

import { goldcommissionRecentCutoffColumns } from "../../tables/gold/commission-release/commission-recent-cutoff-columns";

import type { GoldCommissionRecentCutoffData } from "../../tables/gold/commission-release/commission-recent-cutoff-columns";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";
import Data from "./gold.json";

//

type Props = {};

// Dummy data for GoldCommissionRecentCutoffData
const goldCommissionRecentCutoffData: GoldCommissionRecentCutoffData[] =
  Data.goldCommissionRecentCutoffData || [];

export default function PlatinumRecentCutoff({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Commission</TypographyH2>

          <DataTable
            columns={goldcommissionRecentCutoffColumns}
            data={goldCommissionRecentCutoffData}
            columnWidths={[
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
