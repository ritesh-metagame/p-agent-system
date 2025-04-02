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

//below ends
type Props = {};
// Dummy data for PlatinumTopPerformersAllTimeData
const goldTopPerformersDepositsdata: GoldTopPerformersDeposits[] =
  Data.goldTopPerformersDepositsData || [];

// Dummy data for PlatinumTopPerformersPerCutoffData
const goldTopPerformersGGRdata: GoldTopPerformersGGR[] =
  Data.goldTopPerformersGGRData || [];

//dummy data ends

export default function Dashboard({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div className="mb-5  flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <QRCodeSVG value="https://www.arionplay-referallink.ph" size={80} />
            <p className="text-sm text-black-900">Download QR Code</p>
          </div>
        </div>

        <div className="mb-5 text-start">
          <p className="text-md  ">
            Referral Link:{" "}
            <a href="#" className="text-blue-500">
              https://www.arionplay-referallink.ph
            </a>
          </p>
          <p className="text-md  text-black-900">
            Share this QR code or copy the link to onboard Platinum Partners
          </p>
        </div>

        <CommonDashboard />

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
