import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import { DataTable } from "@/components/tables/data-table";
import {
  OperatorEGames,
  operatoreGamesColumns,
  OperatorNetworkCommissionSettlement,
  operatorNetworkCommissionSettlementColumns,
  OperatorNetworkOverview,
  operatorNetworkOverviewColumns,
  OperatorOverallSummary,
  operatoroverallSummaryColumns,
  OperatorSportsBetting,
  operatorsportsBettingColumns,
  OperatorTopPerformersAllTime,
  operatorTopPerformersAllTime,
  OperatorTopPerformersPerCutoff,
  operatortopPerformersPerCutoff,
} from "@/components/tables/operator/general/dashboard-columns";

type Props = {};

export default function Dashboard({}: Props) {
  const data: OperatorNetworkCommissionSettlement[] = [
    {
      pendingSettlement: "100,000",
      allTimeSettled: "200,000",
    },
    {
      pendingSettlement: "300,000",
      allTimeSettled: "500,000",
    },
  ];

  const operatorData: OperatorNetworkOverview[] = [
    {
      network: "PLATINUM PARTNER",
      approved: 125,
      pending: 14,
      suspended: 3,
      total: 142,
    },
    {
      network: "GOLDEN PARTNER",
      approved: 87,
      pending: 9,
      suspended: 2,
      total: 98,
    },
    {
      network: "PLAYERS ",
      approved: 45,
      pending: 7,
      suspended: 1,
      total: 53,
    },
  ];

  const summaryEGamesData: OperatorOverallSummary[] = [
    {
      item: "TOTAL BETS",
      pendingSettlement: "20",
      previousSettled: "40",
      totalSummary: "120",
    },
    {
      item: "TOTAL WINNINGS",
      pendingSettlement: "10",
      previousSettled: "5",
      totalSummary: "15",
    },
    {
      item: "GGR",
      pendingSettlement: "23000",
      previousSettled: "2000",
      totalSummary: "25000",
    },
    {
      item: "GROSS COMMISSION",
      pendingSettlement: "5000",
      previousSettled: "2000",
      totalSummary: "7000",
    },
    {
      item: "TOTAL DEDUCTIONS",
      pendingSettlement: "4000",
      previousSettled: "3000",
      totalSummary: "1000",
    },
    {
      item: "NET COMMISSION",
      pendingSettlement: "100",
      previousSettled: "70",
      totalSummary: "30",
    },
  ];

  const eGamesData: OperatorEGames[] = [
    {
      item: "TOTAL BETS",
      dailyOverview: "100",
      pendingSettlement: "200",
      previousSettled: "250",
      totalSummary: "500",
    },
    {
      item: "TOTAL WINNINGS",
      dailyOverview: "200",
      pendingSettlement: "150",
      previousSettled: "200",
      totalSummary: "400",
    },
    {
      item: "GGR",
      dailyOverview: "350",
      pendingSettlement: "200",
      previousSettled: "250",
      totalSummary: "200",
    },
    {
      item: "GROSS COMMISSION",
      dailyOverview: "N / A",
      pendingSettlement: "200",
      previousSettled: "300",
      totalSummary: "400",
    },
  ];

  const sportsBettingData: OperatorSportsBetting[] = [
    {
      item: "TOTAL BETS",
      dailyOverview: "150",
      pendingSettlement: "20",
      previousSettled: "130",
      totalSummary: "300",
    },

    {
      item: "GROSS COMMISSION",
      dailyOverview: "500",
      pendingSettlement: "50",
      previousSettled: "450",
      totalSummary: "1000",
    },
  ];

  const performerAllTimeData: OperatorTopPerformersAllTime[] = [
    {
      platinumName: "PLAT-001",
      depositsCutoffPeriod: "Feb 1 - Feb 15, 2025",
      totalDepositsToDate: 100000,
    },
    {
      platinumName: "PLAT-002",
      depositsCutoffPeriod: "Feb 16 - Feb 28, 2025",
      totalDepositsToDate: 85000,
    },
    {
      platinumName: "PLAT-003",
      depositsCutoffPeriod: "Mar 1 - Mar 15, 2025",
      totalDepositsToDate: 120000,
    },
  ];

  const performerOneTimeData: OperatorTopPerformersPerCutoff[] = [
    {
      platinumName: "PLAT-001",
      ggrCutoffPeriod: "Feb 1 - Feb 15, 2025",
      totalGgrToDate: 100000,
    },
    {
      platinumName: "PLAT-002",
      ggrCutoffPeriod: "Feb 16 - Feb 28, 2025",
      totalGgrToDate: 75000,
    },
    {
      platinumName: "PLAT-003",
      ggrCutoffPeriod: "Mar 1 - Mar 15, 2025",
      totalGgrToDate: 110000,
    },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* QR Code and Referral Link */}
      {/* <Card> */}
      <CardContent className="p-4  flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <QRCodeSVG value="https://www.egames-referral-link.ph" size={80} />
          <p className="text-sm text-black-900">Download QR Code</p>
        </div>
      </CardContent>
      <div className="p-4 text-start">
        <p className="text-sm  font-bold">
          Referral Link:{" "}
          <a href="#" className="text-blue-500">
            https://www.egames-referral-link.ph
          </a>
        </p>
        <p className="text-md  text-black-900">
          Share this QR code and copy to onboard platinum
        </p>
      </div>
      {/* </Card> */}

      {/* Cutoff Period Section */}
      <CardContent className="p-1 flex items-center ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">
          Cutoff Period Available For Settlement:
        </h2>
        <p className="text-md font-medium text-gray-700 ml-1">
          Feb 1 - Feb 15, 2025
        </p>
      </CardContent>

      <DataTable
        columns={operatorNetworkCommissionSettlementColumns}
        data={data}
      />

      {/* Network Overview */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">Network Overview</h2>
      </CardContent>

      <DataTable columns={operatorNetworkOverviewColumns} data={operatorData} />

      {/* Summary */}
      <CardContent className="p-1 flex items-center ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">
          Summary E-Games & Sports Betting:
        </h2>
        <p className="text-md font-medium text-gray-700 ml-1 pt-1">
          Cutoff Period :Feb 1 - Feb 15, 2025
        </p>
      </CardContent>

      <DataTable
        columns={operatoroverallSummaryColumns}
        data={summaryEGamesData}
      />

      {/* E- Games */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">E-Games</h2>
      </CardContent>

      <DataTable columns={operatoreGamesColumns} data={eGamesData} />

      {/* Sports Betting */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">SportsBetting</h2>
      </CardContent>

      <DataTable
        columns={operatorsportsBettingColumns}
        data={sportsBettingData}
      />

      {/* Top Performers All Time */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">Top Performers All Time</h2>
      </CardContent>

      <DataTable
        columns={operatorTopPerformersAllTime}
        data={performerAllTimeData}
      />

      {/* Per Cut Off */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">Per Cut Off</h2>
      </CardContent>

      <DataTable
        columns={operatortopPerformersPerCutoff}
        data={performerOneTimeData}
      />
    </div>
  );
}
