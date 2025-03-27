import React from "react";

import { platinumPartnerColumns } from "../../../components/tables/platinum/commission-release/commission-recent-cutoff-columns";
import type { PlatinumPartnerData } from "../../../components/tables/platinum/commission-release/commission-recent-cutoff-columns";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";

const PlatinumPartnerData: PlatinumPartnerData[] = [
  {
    platinumPartner: "Partner Alpha",
    totalBets: "$500,000",
    totalWinnings: "$350,000",
    ggr: "$150,000",
    grossCommissions: "$30,000",
    totalDeductions: "$5,000",
    netCommissions: "$25,000",
  },
  {
    platinumPartner: "Partner Beta",
    totalBets: "$750,000",
    totalWinnings: "$500,000",
    ggr: "$250,000",
    grossCommissions: "$50,000",
    totalDeductions: "$10,000",
    netCommissions: "$40,000",
  },
  {
    platinumPartner: "Partner Gamma",
    totalBets: "$600,000",
    totalWinnings: "$400,000",
    ggr: "$200,000",
    grossCommissions: "$40,000",
    totalDeductions: "$7,000",
    netCommissions: "$33,000",
  },
];

type Props = {};

export default function PlatinumRecentCutoff({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Commission</TypographyH2>

          <DataTable
            columns={platinumPartnerColumns}
            data={PlatinumPartnerData}
            columnWidths={[
              "250px",
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
