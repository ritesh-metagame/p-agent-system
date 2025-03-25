import React from "react";
import {
  platinumcutoffPeriodColumns,
  platinumeGamesColumns,
  platinumnetworkOverviewColumns,
  platinumoverallSummaryColumns,
  platinumsportsbettingColumns,
  platinumtopPerformersAllTimeColumns,
  platinumtopPerformersPerCutoffColumns,
  PlatinumCutoffPeriodData,
  PlatinumEGamesData,
  PlatinumNetworkOverviewData,
  PlatinumOverallSummaryData,
  PlatinumSportsbettingData,
  PlatinumTopPerformersAllTimeData,
  PlatinumTopPerformersPerCutoffData,
} from "../../../components/tables/platinum/general/dashboard-columns";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";

import { DataTable } from "@/components/tables/data-table";

type Props = {};

// dummy data

// Dummy data for PlatinumCutoffPeriodData
const platinumCutoffPeriodData: PlatinumCutoffPeriodData[] = [
  {
    commissionPendingSettlement: "$50,000",
    commissionSettled: "$200,000",
  },
  {
    commissionPendingSettlement: "$30,000",
    commissionSettled: "$150,000",
  },
];

// Dummy data for PlatinumNetworkOverviewData
const platinumNetworkOverviewData: PlatinumNetworkOverviewData[] = [
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

// Dummy data for PlatinumOverallSummaryData
const platinumOverallSummaryData: PlatinumOverallSummaryData[] = [
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

// Dummy data for PlatinumEGamesData
const platinumEGamesData: PlatinumEGamesData[] = [
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

// Dummy data for PlatinumSportsbettingData
const platinumSportsbettingData: PlatinumSportsbettingData[] = [
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
    <div className="container mx-auto p-4 space-y-6">
      <CardContent className="p-4  flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <QRCodeSVG value="https://www.arionplay-referallink.ph" size={80} />
          <p className="text-sm text-black-900">Download QR Code</p>
        </div>
      </CardContent>

      <div className="p-4 text-start">
        <p className="text-sm  font-bold">
          Referral Link:{" "}
          <a href="#" className="text-blue-500">
            https://www.arionplay-referallink.ph
          </a>
        </p>
        <p className="text-md  text-black-900">
          Share this QR code and copy to onboard platinum
        </p>
      </div>

      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">
          Cutoff Period Available For Settlement:
        </h2>
        <p className="text-md font-medium text-gray-700 ml-1">
          Feb 1 - Feb 15, 2025
        </p>
      </CardContent>

      <DataTable
        columns={platinumcutoffPeriodColumns}
        data={platinumCutoffPeriodData}
      />

      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">Network Overview</h2>
      </CardContent>
      <DataTable
        columns={platinumnetworkOverviewColumns}
        data={platinumNetworkOverviewData}
      />

      {/* summary */}
      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">
          Summary:E-Games & sportsBetting Cutoff Period :
        </h2>
        <p className="text-md font-medium text-gray-700 ml-1">
          Feb1 - Feb 15, 2025
        </p>
      </CardContent>
      <DataTable
        columns={platinumoverallSummaryColumns}
        data={platinumOverallSummaryData}
      />

      {/* egames */}

      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">E-Games</h2>
      </CardContent>
      <DataTable columns={platinumeGamesColumns} data={platinumEGamesData} />

      {/* SportsBetting */}

      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">Sports Betting</h2>
      </CardContent>
      <DataTable
        columns={platinumsportsbettingColumns}
        data={platinumSportsbettingData}
      />

      {/* Top Performers All Time */}
      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">Top Performers All Time</h2>
      </CardContent>
      <DataTable
        columns={platinumtopPerformersAllTimeColumns}
        data={platinumTopPerformersAllTimeData}
      />

      {/* Per Cut Off */}
      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">Per Cut Off</h2>
      </CardContent>
      <DataTable
        columns={platinumtopPerformersPerCutoffColumns}
        data={platinumTopPerformersPerCutoffData}
      />
    </div>
  );
}
