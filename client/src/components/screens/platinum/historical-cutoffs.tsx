import React from "react";

import {
  platinumIdStatusActionColumns,
  PlatinumIDStatusActionData,
} from "../../tables/platinum/commission-release/all-commissions-cutoff-columns";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";

type Props = {};

export default function PlatinumHistoricalCutoff({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Commission</TypographyH2>

          <DataTable
            columns={platinumIdStatusActionColumns}
            data={[]}
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
