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
    totalNetworkBets: "$1,000,000",
    totalNetworkWinnings: "$750,000",
    totalNetworkGGR: "$250,000",
    totalNetworkGrossCommissions: "$50,000",
    totalNetworkDeductions: "$10,000",
    totalNetCommissions: "$40,000",
  },
  {
    platinumPartner: "Partner Beta",
    totalNetworkBets: "$800,000",
    totalNetworkWinnings: "$600,000",
    totalNetworkGGR: "$200,000",
    totalNetworkGrossCommissions: "$40,000",
    totalNetworkDeductions: "$8,000",
    totalNetCommissions: "$32,000",
  },
  {
    platinumPartner: "Partner Gamma",
    totalNetworkBets: "$1,200,000",
    totalNetworkWinnings: "$900,000",
    totalNetworkGGR: "$300,000",
    totalNetworkGrossCommissions: "$60,000",
    totalNetworkDeductions: "$12,000",
    totalNetCommissions: "$48,000",
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
