import React from "react";

import { goldcommissionRecentCutoffColumns } from "../../../components/tables/gold/commission-release/commission-recent-cutoff-columns";

import type { GoldCommissionRecentCutoffData } from "../../../components/tables/gold/commission-release/commission-recent-cutoff-columns";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";

type Props = {};

// Dummy data for GoldCommissionRecentCutoffData
const goldCommissionRecentCutoffData: GoldCommissionRecentCutoffData[] = [
  {
    platinumPartner: "Partner Alpha",
    totalBets: "$1,000,000",
    totalWinnings: "$750,000",
    gGR: "$250,000",
    grossCommissions: "$50,000",
    totalDeductions: "$10,000",
    netCommissions: "$40,000",
  },
  {
    platinumPartner: "Partner Beta",
    totalBets: "$800,000",
    totalWinnings: "$600,000",
    gGR: "$200,000",
    grossCommissions: "$40,000",
    totalDeductions: "$8,000",
    netCommissions: "$32,000",
  },
  {
    platinumPartner: "Partner Gamma",
    totalBets: "$1,200,000",
    totalWinnings: "$900,000",
    gGR: "$300,000",
    grossCommissions: "$60,000",
    totalDeductions: "$12,000",
    netCommissions: "$48,000",
  },
];

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
