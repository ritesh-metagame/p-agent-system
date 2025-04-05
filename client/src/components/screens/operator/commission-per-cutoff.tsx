import React from "react";

import {
  operatorNetworkColumns,
  platinumPartnerColumns,
  goldenPartnerColumns,
} from "../../tables/operator/commission-release/commission-per-cutoff-columns";

import type {
  OperatorNetworkData,
  PlatinumPartnerData,
  GoldenPartnerData,
} from "../../tables/operator/commission-release/commission-per-cutoff-columns";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";
import Data from "./operator.json";

//

type Props = {};

// Dummy data for GoldCommissionRecentCutoffData

const operatorNetworkData: OperatorNetworkData[] =
  Data.operatorNetworkData || [];
const platinumPartnerData: PlatinumPartnerData[] =
  Data.platinumPartnerData || [];
const goldenPartnerData: GoldenPartnerData[] = Data.goldenPartnerData || [];

export default function OperatorAllCommissionCutoff({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div className="mb-10">
          <TypographyH2 className="mb-4">All Commission Cutoff</TypographyH2>

          <DataTable
            columns={operatorNetworkColumns}
            // data={goldCommissionRecentCutoffData}
            data={operatorNetworkData}
            // columnWidths={[
            //   "250px",
            //   "250px",
            //   "250px",
            //   "250px",
            //   "250px",
            //   "250px",

            //   "250px",
            //   "250px",
            // ]}
          />
        </div>

        <div className="mb-10">
          <TypographyH2 className="mb-4">All Commission Cutoff</TypographyH2>

          <DataTable
            columns={platinumPartnerColumns}
            // data={goldCommissionRecentCutoffData}
            data={platinumPartnerData}
            // columnWidths={[
            //   "250px",
            //   "250px",
            //   "250px",
            //   "250px",
            //   "250px",
            //   "250px",

            //   "250px",
            //   "250px",
            // ]}
          />
        </div>

        <div className="mb-10">
          <TypographyH2 className="mb-4">All Commission Cutoff</TypographyH2>

          <DataTable
            columns={goldenPartnerColumns}
            // data={goldCommissionRecentCutoffData}
            data={goldenPartnerData}
            // columnWidths={[
            //   "250px",
            //   "250px",
            //   "250px",
            //   "250px",
            //   "250px",
            //   "250px",

            //   "250px",
            //   "250px",
            // ]}
          />
        </div>
      </div>
    </div>
  );
}
