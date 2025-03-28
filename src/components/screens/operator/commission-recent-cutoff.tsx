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
  CommissionRecentCutOff,
  commissionRecentCutsOff,
} from "@/components/tables/operator/general/dashboard-columns";

import Data from "./operator.json";

type Props = {};

export default function CommissionRecentCutsOff({}: Props) {
  const commissionCutOffData: CommissionRecentCutOff[] =
    Data.commissionCutOffData || [];
  // const commissionCutOffData: CommissionRecentCutOff[] = [
  //   {
  //     platinumPartner: "PLAT_001",
  //     totalBets: 1000,
  //     totalWinnings: 500,
  //     ggr: 500,
  //     grossCommission: 100,
  //     totalDeduction: 50,
  //     netCommission: 50,
  //     partnerBreakDown: [{ label: "VIEW" }],
  //     releaseCommissions: [{ label: "RELEASE" }],
  //   },
  // ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Cutoff Period Section */}

      {/* Network Overview */}
      <CardContent className="p-1 flex items-center ">
        {/* <CardContent className=" "> */}
        <h2 className="text-lg font-semibold">Partners </h2>
        <h3 className="text-md font-medium text-gray-700 ml-2">
          Cutoff Period Available For Settlement:
        </h3>
        <p className="text-md font-medium text-gray-700 ml-1">
          Feb 1 - Feb 15, 2025
        </p>
      </CardContent>

      <DataTable
        columns={commissionRecentCutsOff}
        data={commissionCutOffData}
      />

      {/* Summary */}
    </div>
  );
}
