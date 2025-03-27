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
  networkStats,
  NetworkStats,
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
  partnerNetworkCommission,
  PartnerNetworkCommission,
} from "@/components/tables/operator/general/dashboard-columns";

type Props = {};

export default function PartnerManagement({}: Props) {
  const networkStatsData: NetworkStats[] = [
    {
      ppApproved: 50,
      ppPending: 70,
      gpApproved: 45,
      gpPending: 65,
      players: 58,
    },
    {
      ppApproved: 65,
      ppPending: 45,
      gpApproved: 70,
      gpPending: 30,
      players: 75,
    },
  ];

  const partnerNetworkCommissionData: PartnerNetworkCommission[] = [
    {
      platinumPartner: "PLAT-001",
      pendingCommission: 100000,
      status: "PENDING",
      allTime: 200000,
      summary: 300000,
    },
    {
      platinumPartner: "PLAT-002",
      pendingCommission: 200000,
      status: "PENDING",
      allTime: 300000,
      summary: 500000,
    },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Cutoff Period Section */}

      {/* Network Overview */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">Network Stats</h2>
      </CardContent>

      <DataTable columns={networkStats} data={networkStatsData} />

      {/* Summary */}
      <CardContent className="p-1 flex items-center ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">Network Commission</h2>
      </CardContent>

      <DataTable
        columns={partnerNetworkCommission}
        data={partnerNetworkCommissionData}
      />
      <CardContent className="p-1 flex items-center ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">
          Cutoff Period Available For Settlement:
        </h2>
        <p className="text-md font-medium text-gray-700 ml-1">
          Feb 1 - Feb 15, 2025
        </p>
      </CardContent>
    </div>
  );
}
