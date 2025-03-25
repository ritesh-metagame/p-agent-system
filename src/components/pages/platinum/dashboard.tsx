import React from "react";
import {
  platinumcutoffPeriodColumns,
  platinumeGamesColumns,
  platinumnetworkOverviewColumns,
  platinumoverallSummaryColumns,
  platinumsportsbettingColumns,
  platinumtopPerformersAllTimeColumns,
  platinumtopPerformersPerCutoffColumns,
} from "../../../components/tables/platinum/general/dashboard-columns";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";

import { DataTable } from "@/components/tables/data-table";

type Props = {};

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

      <DataTable columns={platinumcutoffPeriodColumns} data={[]} />

      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">Network Overview</h2>
      </CardContent>
      <DataTable columns={platinumnetworkOverviewColumns} data={[]} />

      {/* summary */}
      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">
          Summary:E-Games & sportsBetting Cutoff Period :
        </h2>
        <p className="text-md font-medium text-gray-700 ml-1">
          Feb1 - Feb 15, 2025
        </p>
      </CardContent>
      <DataTable columns={platinumoverallSummaryColumns} data={[]} />

      {/* egames */}

      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">E-Games</h2>
      </CardContent>
      <DataTable columns={platinumeGamesColumns} data={[]} />

      {/* SportsBetting */}

      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">SportsBetting</h2>
      </CardContent>
      <DataTable columns={platinumsportsbettingColumns} data={[]} />

      {/* Top Performers All Time */}
      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">Top Performers All Time</h2>
      </CardContent>
      <DataTable columns={platinumtopPerformersAllTimeColumns} data={[]} />

      {/* Per Cut Off */}
      <CardContent className="p-1 flex items-center ">
        <h2 className="text-lg font-semibold">Per Cut Off</h2>
      </CardContent>
      <DataTable columns={platinumtopPerformersPerCutoffColumns} data={[]} />
    </div>
  );
}
