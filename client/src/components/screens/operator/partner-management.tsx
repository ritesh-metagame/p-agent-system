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
import Data from "./operator.json";

type Props = {};

export default function PartnerManagement({}: Props) {
  const networkStatsData: NetworkStats[] = Data.networkStatsData || [];

  const partnerNetworkCommissionData: PartnerNetworkCommission[] =
    Data.partnerNetworkCommissionData || [];

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
