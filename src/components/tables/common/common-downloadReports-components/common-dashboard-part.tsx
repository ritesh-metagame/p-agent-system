import React from "react";
import {
  cutoffPeriodColumns,
  networkOverviewColumns,
  overallSummaryColumns,
  eGamesColumns,
  sportsbettingColumns,
} from "../common-column-defs/common-dashboard-part-column";

import type {
  CutoffPeriodData,
  NetworkOverviewData,
  EGamesData,
  SportsbettingData,
  OverallSummaryData,
} from "../common-column-defs/common-dashboard-part-column";
import { QRCodeSVG } from "qrcode.react";

import { CommonDashboardProps } from "@/types/dashBoardTypes";
import { Card, CardContent } from "@/components/ui/card";
import { TypographyH2 } from "@/components/ui/typographyh2";
// import { TypographyH4 } from "@/components/ui/typographyh4";

import { DataTable } from "@/components/tables/data-table";
import Data from "./dashboard.json";

type Props = {};

// dummy data starts

// Dummy data for  CutoffPeriodData
const CutoffPeriodData: CutoffPeriodData[] = Data.cutoffPeriodData || [];

// Dummy data for  NetworkOverviewData
const NetworkOverviewData: NetworkOverviewData[] =
  Data.networkOverviewData || [];

// Dummy data for  OverallSummaryData
const OverallSummaryData: OverallSummaryData[] = Data.overallSummaryData || [];

// Dummy data for  EGamesData
const EGamesData: EGamesData[] = Data.eGamesData || [];

// Dummy data for  SportsbettingData
const SportsbettingData: SportsbettingData[] = Data.sportsbettingData || [];

//dummy data ends

export default function CommonDashboard({
  welcomeTierName,
  referralLink,
  networkOverviewData,
}: CommonDashboardProps) {
  return (
    <div>
      {/* QR Code and Referral Link */}
      {/* <Card> */}
      <CardContent className="p-4  flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <QRCodeSVG value={referralLink} size={80} />
          <p className="text-sm text-black-900">Download QR Code</p>
        </div>
      </CardContent>
      <div className="p-4 text-start">
        <p className="text-sm  font-bold">
          Referral Link:{" "}
          <a href="#" className="text-blue-500">
            {referralLink}
          </a>
        </p>
        <p className="text-md  text-black-900">
          Share this QR code and copy to onboard {welcomeTierName}
        </p>
      </div>
      {/* </Card> */}
      <div className="container mb-10">
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <TypographyH2 className="mb-4">
              Cutoff Period Available For Settlement :
            </TypographyH2>
            <p className="text-md font-medium text-gray-700">
              Feb 1 - Feb 15, 2025
            </p>
          </div>

          <DataTable
            columns={cutoffPeriodColumns}
            data={CutoffPeriodData}
            columnWidths={["250px", "250px"]}
          />
        </div>

        <div className="mb-10">
          <TypographyH2 className="mb-4">Network Overview</TypographyH2>

          <DataTable
            columns={networkOverviewColumns}
            data={networkOverviewData}
            columnWidths={["250px", "250px", "250px", "250px", "250px"]}
          />
        </div>

        {/* summary */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <TypographyH2 className="mb-4">
              Summary: E-Games & sportsBetting
            </TypographyH2>
            <p className="text-md font-medium text-gray-700">
              Cutoff Period: Feb 1 - Feb 15, 2025
            </p>
          </div>

          <DataTable
            columns={overallSummaryColumns}
            data={OverallSummaryData}
            columnWidths={["250px", "250px", "250px", "250px"]}
          />
        </div>

        {/* egames */}

        <div className="mb-10">
          <TypographyH2 className="mb-4">E-GAMES</TypographyH2>

          <DataTable
            columns={eGamesColumns}
            data={EGamesData}
            columnWidths={["250px", "250px", "250px", "250px", "250px"]}
          />
        </div>

        {/* SportsBetting */}

        <div className="mb-10">
          <TypographyH2 className="mb-4">SportsBetting</TypographyH2>

          <DataTable
            columns={sportsbettingColumns}
            data={SportsbettingData}
            columnWidths={["250px", "250px", "250px", "250px", "250px"]}
          />
        </div>
      </div>
    </div>
  );
}
