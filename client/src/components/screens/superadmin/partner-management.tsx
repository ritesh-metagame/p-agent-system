import { DataTable } from "@/components/tables/data-table";
import {
  networkCommissionColumns,
  partnerManagementColumns,
} from "@/components/tables/superadmin/network/partner-management-columns";

import type {
  NetworkCommissionData,
  PartnerManagementData,
} from "@/components/tables/superadmin/network/partner-management-columns";
import { TypographyH2 } from "@/components/ui/typographyh2";
import { TypographyH4 } from "@/components/ui/typographyh4";
import React from "react";
import Data from "./superAdmin.json";

const networkCommissionData: NetworkCommissionData[] =
  Data.networkCommissionData || [];

// Dummy data for NETWORK STATS
export const allNetworkStatsData: PartnerManagementData[] =
  Data.allNetworkStatsData || [];

export const operatorWiseNetworkStatsData: PartnerManagementData[] =
  Data.operatorWiseNetworkStatsData || [];

type Props = {};

export default async function PartnerManagement({}: Props) {
  const response = await fetch("");
  const responseJson = await response.json();

  return (
    <div>
      <div className="mb-10">
        <TypographyH2 className="mb-4">Network Stats</TypographyH2>
        <div className="mb-4">
          <DataTable
            columns={partnerManagementColumns}
            data={allNetworkStatsData}
            columnWidths={[
              "300px",
              "250px",
              "150px",
              "150px",
              "150px",
              "150px",
              "150px",
            ]}
          />
        </div>
        <DataTable
          columns={partnerManagementColumns}
          data={operatorWiseNetworkStatsData}
          columnWidths={[
            "300px",
            "250px",
            "150px",
            "150px",
            "150px",
            "150px",
            "150px",
          ]}
        />
      </div>
      <div className="mb-10">
        <div className="mb-4">
          <TypographyH2 className="mb-2">Network Commissions</TypographyH2>
        </div>
        <div className="mb-4">
          <DataTable
            columns={networkCommissionColumns}
            data={networkCommissionData}
            columnWidths={["300px", "250px", "150px", "150px", "150px"]}
            tooltips={{
              pendingCommission: "As of available cutoff period",
            }}
          />
        </div>
      </div>
      <div className="mb-10">
        <div className="mb-4">
          <TypographyH4 className="mb-2">
            Cutoff period available for settlement:{" "}
            <span className="text-gray-500">Feb 1 - Feb 15, 2025</span>
          </TypographyH4>
        </div>
      </div>
    </div>
  );
}
