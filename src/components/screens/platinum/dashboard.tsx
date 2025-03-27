import React from "react";
import {
  platinumtopPerformersAllTimeColumns,
  platinumtopPerformersPerCutoffColumns,
  PlatinumTopPerformersAllTimeData,
  PlatinumTopPerformersPerCutoffData,
} from "../../tables/platinum/general/dashboard-columns";
import { QRCodeSVG } from "qrcode.react";

import { TypographyH2 } from "@/components/ui/typographyh2";

import { DataTable } from "@/components/tables/data-table";
import CommonDashboard from "@/components/tables/common/common-downloadReports-components/common-dashboard-part";

type Props = {};

// Dummy data for PlatinumTopPerformersAllTimeData
const platinumTopPerformersAllTimeData: PlatinumTopPerformersAllTimeData[] = [
  {
    goldenName: "GP-001",
    pendingCommission: "$12,000",
    released: "$50,000",
  },
  {
    goldenName: "GP-002",
    pendingCommission: "$15,000",
    released: "$60,000",
  },
];

// Dummy data for PlatinumTopPerformersPerCutoffData
const platinumTopPerformersPerCutoffData: PlatinumTopPerformersPerCutoffData[] =
  [
    {
      goldenName: "GP-001",
      pendingCommission: "$3,000",
      released: "$10,000",
    },
    {
      goldenName: "GP-002",
      pendingCommission: "$4,000",
      released: "$12,000",
    },
  ];

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
