import React from "react";

import { platinumPartnerColumns } from "../../tables/platinum/commission-release/commission-recent-cutoff-columns";
import type { PlatinumPartnerData } from "../../tables/platinum/commission-release/commission-recent-cutoff-columns";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";
import Data from "./platinum.json";

const platinumPartnerData: PlatinumPartnerData[] =
  Data.platinumPartnerData || [];

type Props = {};

export default function PlatinumRecentCutoff({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Commission</TypographyH2>

          <DataTable
            columns={platinumPartnerColumns}
            data={platinumPartnerData}
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
