import React from "react";

import {
  platinumcommissionPerCutoffColumns,
  platinumpartnerCommissionColumns,
} from "../../tables/platinum/commission-release/commission-per-cutoff-columns";
import type {
  PlatinumCommissionPerCutoffData,
  PlatinumPartnerCommissionData,
} from "../../tables/platinum/commission-release/commission-per-cutoff-columns";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";
import Data from "./platinum.json";

const platinumCommissionPerCutoffData: PlatinumCommissionPerCutoffData[] =
  Data.platinumCommissionPerCutoffData || [];

const platinumPartnerCommissionData: PlatinumPartnerCommissionData[] =
  Data.platinumPartnerCommissionData || [];

type Props = {};

export default function PlatinumPerCutoff({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Commission</TypographyH2>

          <DataTable
            columns={platinumcommissionPerCutoffColumns}
            data={platinumCommissionPerCutoffData}
            // columnWidths={[
            //   "250px",
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
          <TypographyH2 className="mb-4">Network Commission</TypographyH2>

          <DataTable
            columns={platinumpartnerCommissionColumns}
            data={platinumPartnerCommissionData}
            // columnWidths={[
            //   "250px",
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
