import React from "react";
import {
  goldtopPerformersDepositsColumns,
  goldtopPerformersGgrColumns,
  GoldTopPerformersGGR,
  GoldTopPerformersDeposits,
} from "../../tables/gold/general/dashboard-columns";
import { QRCodeSVG } from "qrcode.react";

import { TypographyH2 } from "@/components/ui/typographyh2";
import { TypographyH4 } from "@/components/ui/typographyh4";

import { DataTable } from "@/components/tables/data-table";
import CommonDashboard from "@/components/tables/common/common-downloadReports-components/common-dashboard-part";
import Data from "./gold.json";
import { useSelector } from "@/redux/store";

//below ends
type Props = {};
// Dummy data for PlatinumTopPerformersAllTimeData
const goldTopPerformersDepositsdata: GoldTopPerformersDeposits[] =
  Data.goldTopPerformersDepositsData || [];

// Dummy data for PlatinumTopPerformersPerCutoffData
const goldTopPerformersGGRdata: GoldTopPerformersGGR[] =
  Data.goldTopPerformersGGRData || [];
const networkOverviewData: any[] = Data.networkOverviewData;

//dummy data ends

export default function Dashboard({}: Props) {
  const user = useSelector((state) => state.authReducer.user);

  return (
    <div>
      <div className="container mb-10">
        <CommonDashboard
          welcomeTierName="Platinum Partners"
          referralLink={user?.affiliateLink}
          networkOverviewData={networkOverviewData}
        />

        {/* Top Performers All Time */}
        <div className="mb-10">
          <TypographyH2 className="mb-4">Top Performers </TypographyH2>
          <TypographyH4 className="mb-4">Depositors</TypographyH4>
          <DataTable
            columns={goldtopPerformersDepositsColumns}
            data={goldTopPerformersDepositsdata}
            columnWidths={["250px", "250px", "250px"]}
            tooltips={{
              deposits: "As of available cutoff period",
            }}
          />
        </div>

        {/* Per Cut Off */}
        <div className="mb-10">
          <TypographyH4 className="mb-4">GGR</TypographyH4>

          <DataTable
            columns={goldtopPerformersGgrColumns}
            data={goldTopPerformersGGRdata}
            columnWidths={["250px", "250px", "250px"]}
            tooltips={{
              ggr: "As of available cutoff period",
            }}
          />
        </div>
      </div>
    </div>
  );
}
