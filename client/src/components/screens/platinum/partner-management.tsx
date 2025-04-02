import React from "react";

import {
  platinumnetworkCommissionColumns,
  platinumnetworkStatsColumns,
} from "../../tables/platinum/network/partner-management-columns";

import type {
  PlatinumNetworkCommissionData,
  PlatinumNetworkStatsData,
} from "../../tables/platinum/network/partner-management-columns";
// import { QRCodeSVG } from "qrcode.react";
// import { Card, CardContent } from "@/components/ui/card";
import { TypographyH2 } from "@/components/ui/typographyh2";
// import { TypographyH4 } from "@/components/ui/typographyh4";

import { DataTable } from "@/components/tables/data-table";
import Data from "./platinum.json";

type Props = {};

// Dummy data for PlatinumNetworkStatsData
const PlatinumNetworkStatsData: PlatinumNetworkStatsData[] =
  Data.platinumNetworkStatsData || [];
// Dummy data for PlatinumNetworkCommissionData
const PlatinumNetworkCommissionData: PlatinumNetworkCommissionData[] =
  Data.platinumNetworkCommissionData || [];

export default function PlatinumPartnerManagement({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Stats</TypographyH2>
          <DataTable
            columns={platinumnetworkStatsColumns}
            data={PlatinumNetworkStatsData}
            // data={[]}
            columnWidths={["250px", "250px", "250px"]}
            tooltips={{
              gpPending: "As of available cutoff period",
            }}
          />
        </div>

        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Commission</TypographyH2>

          <DataTable
            columns={platinumnetworkCommissionColumns}
            // data={platinumNetworkOverviewData}
            data={PlatinumNetworkCommissionData}
            columnWidths={["250px", "250px", "250px", "250px", "250px"]}
            tooltips={{
              pendingCommission: "As of available cutoff period",
            }}
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
