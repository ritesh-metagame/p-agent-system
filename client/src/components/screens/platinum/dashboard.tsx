import React from "react";
import {
  platinumtopPerformersAllTimeColumns,
  platinumtopPerformersPerCutoffColumns,
  PlatinumTopPerformersAllTimeData,
  PlatinumTopPerformersPerCutoffData,
  PlatinumNetworkOverviewData,
} from "../../tables/platinum/general/dashboard-columns";
import { QRCodeSVG } from "qrcode.react";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";
import CommonDashboard from "@/components/tables/common/common-downloadReports-components/common-dashboard-part";
import Data from "./platinum.json";
import { useSelector } from "@/redux/store";

type Props = {};

// Dummy data for PlatinumTopPerformersAllTimeData
const platinumTopPerformersAllTimeData: PlatinumTopPerformersAllTimeData[] =
  Data.platinumTopPerformersAllTimeData || [];

// Dummy data for PlatinumTopPerformersPerCutoffData
const platinumTopPerformersPerCutoffData: PlatinumTopPerformersPerCutoffData[] =
  Data.platinumTopPerformersPerCutoffData || [];

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
          <TypographyH2 className="mb-4">Top Performers All Time</TypographyH2>

          <DataTable
            columns={platinumtopPerformersAllTimeColumns}
            data={platinumTopPerformersAllTimeData}
            columnWidths={["250px", "250px", "250px"]}
            tooltips={{
              pendingCommission: "As of available cutoff period",
            }}
          />
        </div>

        {/* Per Cut Off */}
        <div className="mb-10">
          <TypographyH2 className="mb-4">Per Cut Off</TypographyH2>

          <DataTable
            columns={platinumtopPerformersPerCutoffColumns}
            data={platinumTopPerformersPerCutoffData}
            columnWidths={["250px", "250px", "250px"]}
            tooltips={{
              pendingCommission: "As of available cutoff period",
            }}
          />
        </div>
      </div>
    </div>
  );
}
