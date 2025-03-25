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
  operatoreGamesColumns,
  operatornetworkCommissionSettlementColumns,
  operatornetworkOverviewColumns,
  operatoroverallSummaryColumns,
  operatorsportsBettingColumns,
  operatorTopPerformersAllTime,
  operatortopPerformersPerCutoff,
} from "@/components/tables/operator/general/dashboard-columns";

type Props = {};

export default function Dashboard({}: Props) {
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
        columns={operatornetworkCommissionSettlementColumns}
        data={[]}
      />

      {/* Network Overview */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">Network Overview</h2>
      </CardContent>

      <DataTable columns={operatornetworkOverviewColumns} data={[]} />

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

      <DataTable columns={operatoroverallSummaryColumns} data={[]} />

      {/* E- Games */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">E-Games</h2>
      </CardContent>

      <DataTable columns={operatoreGamesColumns} data={[]} />

      {/* Sports Betting */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">SportsBetting</h2>
      </CardContent>

      <DataTable columns={operatorsportsBettingColumns} data={[]} />

      {/* Top Performers All Time */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">Top Performers All Time</h2>
      </CardContent>

      <DataTable columns={operatorTopPerformersAllTime} data={[]} />

      {/* Per Cut Off */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">Per Cut Off</h2>
      </CardContent>

      <DataTable columns={operatortopPerformersPerCutoff} data={[]} />
    </div>
  );
}
