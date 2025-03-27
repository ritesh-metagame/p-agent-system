import React from "react";

import {
  goldNetworkStatsColumns,
  goldnetworkCommissionColumns,
  CommissionStatus,
} from "../../../components/tables/gold/network/partner-management-columns";

import type {
  GoldNetworkCommissionData,
  GoldNetworkStats,
} from "../../../components/tables/gold/network/partner-management-columns";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";

type Props = {};

// Dummy data for GoldNetworkStats
const goldNetworkStatsData: GoldNetworkStats[] = [
  {
    players: "1,500",
  },
  {
    players: "2,000",
  },
  {
    players: "1,750",
  },
];

// Dummy data for GoldNetworkCommissionData
const goldNetworkCommissionData: GoldNetworkCommissionData[] = [
  {
    partner: "Partner Alpha",
    pendingCommission: "$20,000",
    status: CommissionStatus.Pending,
    allTime: "$150,000",
    total: "$170,000",
  },
  {
    partner: "Partner Beta",
    pendingCommission: "$15,000",
    status: CommissionStatus.Released,
    allTime: "$120,000",
    total: "$135,000",
  },
  {
    partner: "Partner Gamma",
    pendingCommission: "$25,000",
    status: CommissionStatus.Pending,
    allTime: "$200,000",
    total: "$225,000",
  },
];

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
