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
// import { Card, CardContent } from "@/components/ui/card";
import { TypographyH2 } from "@/components/ui/typographyh2";
// import { TypographyH4 } from "@/components/ui/typographyh4";

import { DataTable } from "@/components/tables/data-table";

type Props = {};

// dummy data starts

// Dummy data for  CutoffPeriodData
const CutoffPeriodData: CutoffPeriodData[] = [
  {
    commissionPendingSettlement: "$50,000",
    commissionSettled: "$200,000",
  },
  {
    commissionPendingSettlement: "$30,000",
    commissionSettled: "$150,000",
  },
];

// Dummy data for  NetworkOverviewData
const NetworkOverviewData: NetworkOverviewData[] = [
  {
    network: "GOLDEN PARTNER",
    approved: 120,
    pending: 15,
    suspended: 5,
    summary: 140,
  },
  {
    network: "PLAYERS",
    approved: 300,
    pending: 25,
    suspended: 10,
    summary: 335,
  },
];

// Dummy data for  OverallSummaryData
const OverallSummaryData: OverallSummaryData[] = [
  {
    item: "TOTAL BETS",
    pendingSettlement: "$100,000",
    previousSettled: "$500,000",
    summary: "$600,000",
  },
  {
    item: "TOTAL WINS",
    pendingSettlement: "$90,000",
    previousSettled: "$300,000",
    summary: "$360,000",
  },
  {
    item: "GGR",
    pendingSettlement: "$40,000",
    previousSettled: "$200,000",
    summary: "$240,000",
  },
  {
    item: "GROSS COMMISSIONS",
    pendingSettlement: "$10,000",
    previousSettled: "$50,000",
    summary: "$60,000",
  },
  {
    item: "TOTAL DEDUCTIONS",
    pendingSettlement: "$10,000",
    previousSettled: "$50,000",
    summary: "$60,000",
  },
  {
    item: "NET COMMISSIONS",
    pendingSettlement: "$10,000",
    previousSettled: "$50,000",
    summary: "$60,000",
  },
];

// Dummy data for  EGamesData
const EGamesData: EGamesData[] = [
  {
    item: "TOTAL BETS",
    dailyOverview: "$5,000",
    pendingSettlement: "$2,000",
    previousSettled: "$20,000",
    summary: "$22,000",
  },
  {
    item: "TOTAL WINNINGS",
    dailyOverview: "$7,000",
    pendingSettlement: "$3,000",
    previousSettled: "$25,000",
    summary: "$28,000",
  },
  {
    item: "GGR",
    dailyOverview: "$7,000",
    pendingSettlement: "$3,000",
    previousSettled: "$25,000",
    summary: "$28,000",
  },
  {
    item: "GROSS COMMISSIONS",
    dailyOverview: "$7,000",
    pendingSettlement: "$3,000",
    previousSettled: "$25,000",
    summary: "$28,000",
  },
];

// Dummy data for  SportsbettingData
const SportsbettingData: SportsbettingData[] = [
  {
    item: "TOTAL BETS",
    dailyOverview: "$8,000",
    pendingSettlement: "$4,000",
    previousSettled: "$30,000",
    summary: "$34,000",
  },
  {
    item: "GROSS COMMISSIONS",
    dailyOverview: "$6,000",
    pendingSettlement: "$2,500",
    previousSettled: "$22,000",
    summary: "$24,500",
  },
];

//dummy data ends

export default function CommonDashboard({}: Props) {
  return (
    <div>
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
            data={NetworkOverviewData}
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
