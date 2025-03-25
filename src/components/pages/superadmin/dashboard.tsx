import { DataTable } from "@/components/tables/data-table";
import {
  CommissionOverview,
  commissionOverviewColumns,
  NetworkStatistics,
  networkStatisticsColumn,
} from "@/components/tables/superadmin/general/dashboard-columns";
import { TypographyH2 } from "@/components/ui/typographyh2";
import React from "react";

type Props = {};

const data: NetworkStatistics[] = [
  {
    id: "OPERATOR",
    approved: 125,
    pending: 14,
    declined: 3,
  },
  {
    id: "PLATINUM",
    approved: 87,
    pending: 9,
    declined: 2,
  },
  {
    id: "GOLDEN",
    approved: 45,
    pending: 7,
    declined: 1,
  },
  {
    id: "PLAYERS",
    approved: 350,
    pending: 42,
    declined: 8,
  },
];

const dummyCommissionData: CommissionOverview[] = [
  {
    id: "OPERATOR",
    pendingCommission: 40000,
    releasedAllTime: 10000,
  },
  {
    id: "PLATINUM",
    pendingCommission: 60000,
    releasedAllTime: 2000,
  },
  {
    id: "GOLDEN",
    pendingCommission: 70000,
    releasedAllTime: 1500,
  },
];

export default function Dashboard({}: Props) {
  return (
    <div>
      <div>
        <TypographyH2 className="mb-4">Operator Statistics</TypographyH2>
        <DataTable
          columns={networkStatisticsColumn}
          data={data}
          columnWidths={["250px", "250px", "250px"]}
        />
      </div>
      <div>
        <TypographyH2 className="mb-4">Commissions Overview</TypographyH2>
        <DataTable
          columns={commissionOverviewColumns}
          data={dummyCommissionData}
          columnWidths={["250px", "250px"]}
          tooltips={{
            pendingCommission: "The total amount of pending commissions",
          }}
        />
      </div>
    </div>
  );
}
