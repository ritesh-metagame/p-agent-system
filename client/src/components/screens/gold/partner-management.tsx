import React from "react";

import {
  goldNetworkStatsColumns,
  goldnetworkCommissionColumns,
} from "../../tables/gold/network/partner-management-columns";

import type {
  GoldNetworkCommissionData,
  GoldNetworkStats,
} from "../../tables/gold/network/partner-management-columns";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";
import Data from "./gold.json";

type Props = {};

// Dummy data for GoldNetworkStats
const goldNetworkStatsData: GoldNetworkStats[] =
  Data.goldNetworkStatsData || [];

// Dummy data for GoldNetworkCommissionData
const goldNetworkCommissionData: GoldNetworkCommissionData[] =
  Data.goldNetworkCommissionData || [];

export default function PlatinumPartnerManagement({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Stats</TypographyH2>
          <DataTable
            columns={goldNetworkStatsColumns}
            data={goldNetworkStatsData}
            columnWidths={["250px"]}
          />
        </div>

        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Commission</TypographyH2>

          <DataTable
            columns={goldnetworkCommissionColumns}
            data={goldNetworkCommissionData}
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
