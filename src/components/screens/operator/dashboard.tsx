import React from "react";
import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";
// import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import { DataTable } from "@/components/tables/data-table";
import {
  OperatorTopPerformersAllTime,
  operatorTopPerformersAllTime,
  OperatorTopPerformersPerCutoff,
  operatortopPerformersPerCutoff,
} from "@/components/tables/operator/general/dashboard-columns";
import CommonDashboard from "@/components/tables/common/common-downloadReports-components/common-dashboard-part";
import Data from "./operator.json";

type Props = {};

export default function Dashboard({}: Props) {
  const performerAllTimeData: OperatorTopPerformersAllTime[] =
    Data.performerAllTimeData || [];
  const performerOneTimeData: OperatorTopPerformersPerCutoff[] =
    Data.performerOneTimeData || [];

  // const performerAllTimeData: OperatorTopPerformersAllTime[] = [
  //   {
  //     platinumName: "PLAT-001",
  //     depositsCutoffPeriod: "Feb 1 - Feb 15, 2025",
  //     totalDepositsToDate: 100000,
  //   },
  //   {
  //     platinumName: "PLAT-002",
  //     depositsCutoffPeriod: "Feb 16 - Feb 28, 2025",
  //     totalDepositsToDate: 85000,
  //   },
  //   {
  //     platinumName: "PLAT-003",
  //     depositsCutoffPeriod: "Mar 1 - Mar 15, 2025",
  //     totalDepositsToDate: 120000,
  //   },
  // ];

  // const performerOneTimeData: OperatorTopPerformersPerCutoff[] = [
  //   {
  //     platinumName: "PLAT-001",
  //     ggrCutoffPeriod: "Feb 1 - Feb 15, 2025",
  //     totalGgrToDate: 100000,
  //   },
  //   {
  //     platinumName: "PLAT-002",
  //     ggrCutoffPeriod: "Feb 16 - Feb 28, 2025",
  //     totalGgrToDate: 75000,
  //   },
  //   {
  //     platinumName: "PLAT-003",
  //     ggrCutoffPeriod: "Mar 1 - Mar 15, 2025",
  //     totalGgrToDate: 110000,
  //   },
  // ];

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

      {/* below is the common-dashboard-part rendered */}
      <CommonDashboard />

      {/* Top Performers All Time */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">Top Performers All Time</h2>
      </CardContent>

      <DataTable
        columns={operatorTopPerformersAllTime}
        data={performerAllTimeData}
        tooltips={{
          pendingCommission: "As of available cutoff period",
        }}
      />

      {/* Per Cut Off */}
      <CardContent className="p-1  ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">Per Cut Off</h2>
      </CardContent>

      <DataTable
        columns={operatortopPerformersPerCutoff}
        data={performerOneTimeData}
        tooltips={{
          pendingCommission: "As of available cutoff period",
        }}
      />
    </div>
  );
}
