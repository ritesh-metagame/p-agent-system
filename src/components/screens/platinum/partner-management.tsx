import React from "react";

import {
  platinumnetworkCommissionColumns,
  platinumnetworkStatsColumns,
} from "../../../components/tables/platinum/network/partner-management-columns";

import type {
  PlatinumNetworkCommissionData,
  PlatinumNetworkStatsData,
} from "../../../components/tables/platinum/network/partner-management-columns";
// import { QRCodeSVG } from "qrcode.react";
// import { Card, CardContent } from "@/components/ui/card";
import { TypographyH2 } from "@/components/ui/typographyh2";
// import { TypographyH4 } from "@/components/ui/typographyh4";

import { DataTable } from "@/components/tables/data-table";

type Props = {};

// Dummy data for PlatinumNetworkStatsData
const PlatinumNetworkStatsData: PlatinumNetworkStatsData[] = [
  {
    gpApproved: 120,
    gpPending: 30,
    players: 500,
  },
  {
    gpApproved: 95,
    gpPending: 20,
    players: 450,
  },
];

// Dummy data for PlatinumNetworkCommissionData
const PlatinumNetworkCommissionData: PlatinumNetworkCommissionData[] = [
  {
    partner: "Partner A",
    pendingCommission: "$12,000",
    status: "Active",
    allTime: "$150,000",
    total: "$162,000",
  },
  {
    partner: "Partner B",
    pendingCommission: "$8,500",
    status: "Pending",
    allTime: "$120,000",
    total: "$128,500",
  },
  {
    partner: "Partner C",
    pendingCommission: "$15,000",
    status: "Suspended",
    allTime: "$180,000",
    total: "$195,000",
  },
];

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
          />
        </div>

        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Commission</TypographyH2>

          <DataTable
            columns={platinumnetworkCommissionColumns}
            // data={platinumNetworkOverviewData}
            data={PlatinumNetworkCommissionData}
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
