import React from "react";

import {
  goldNetworkStatsColumns,
  goldnetworkCommissionColumns,
  GoldNetworkCommissionData,
  GoldNetworkStats,
} from "../../../components/tables/gold/network/partner-management-columns";
// import { QRCodeSVG } from "qrcode.react";
// import { Card, CardContent } from "@/components/ui/card";
import { TypographyH2 } from "@/components/ui/typographyh2";
// import { TypographyH4 } from "@/components/ui/typographyh4";

import { DataTable } from "@/components/tables/data-table";

type Props = {};

export default function PlatinumPartnerManagement({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Stats</TypographyH2>
          <DataTable
            columns={goldNetworkStatsColumns}
            // data={platinumCutoffPeriodData}
            data={[]}
            columnWidths={["250px"]}
          />
        </div>

        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Commission</TypographyH2>

          <DataTable
            columns={goldnetworkCommissionColumns}
            // data={platinumNetworkOverviewData}
            data={[]}
            columnWidths={["250px", "250px", "250px", "250px", "250px"]}
          />
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-4">
            <TypographyH2 className="mb-4">
              Cutof Period Available For settlement
            </TypographyH2>
            <p className="text-md font-medium text-gray-700">
              Feb 1 - Feb 15, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
