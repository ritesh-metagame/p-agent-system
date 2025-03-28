import { DataTable } from "@/components/tables/data-table";
import {
  CategoryFinancialOverview,
  categoryFinancialOverviewColumns,
  CommissionOverview,
  commissionOverviewColumns,
  FinancialOverview,
  financialOverviewColumns,
  NetworkStatistics,
  networkStatisticsColumn,
  SportsBettingOverview,
  sportsBettingOverviewColumns,
  topPerformersColumns,
  TopPerformersOverview,
  topPlayersDepositsColumns,
  TopPlayersDepositsOverview,
  topPlayersGGRColumns,
  TopPlayersGGROverview,
} from "@/components/tables/superadmin/general/dashboard-columns";
import { TypographyH2 } from "@/components/ui/typographyh2";
import { TypographyH4 } from "@/components/ui/typographyh4";
import React from "react";

import Data from "./superAdmin.json";

// type Props = {};

const data: NetworkStatistics[] = Data.networkStatistics || [];

const dummyCommissionData: CommissionOverview[] = Data.commissionOverview || [];
export const financialOverviewData: FinancialOverview[] =
  Data.financialOverview || [];

const topPlayersDepositsData: TopPlayersDepositsOverview[] =
  Data.topPlayersDepositsOverview || [];
const topPlayersGGRData: TopPlayersGGROverview[] =
  Data.topPlayersGGROverview || [];

export const categoryFinancialOverviewData: CategoryFinancialOverview[] =
  Data.categoryFinancialOverview || [];

const sportsBettingOverviewData: SportsBettingOverview[] =
  Data.sportsBettingOverview || [];

const topPerformersData: TopPerformersOverview[] =
  Data.topPerformersOverview || [];

const topPerformersDataPerCutoff: TopPerformersOverview[] =
  Data.topPerformersOverview || [];

export default function Dashboard({}) {
  return (
    <div>
      <div className="mb-10">
        <TypographyH2 className="mb-4">Operator Statistics</TypographyH2>
        <DataTable
          columns={networkStatisticsColumn}
          data={data}
          columnWidths={["250px", "250px", "250px"]}
        />
      </div>
      <div className="mb-10">
        <div className="mb-4">
          <TypographyH2 className="mb-2">Commissions Overview</TypographyH2>
          <p>
            Cutoff period available for settlement:{" "}
            <span>Feb1 - Feb 15, 2025</span>
          </p>
        </div>
        <div className="mb-4">
          <DataTable
            columns={commissionOverviewColumns}
            data={dummyCommissionData}
            columnWidths={["250px", "250px"]}
            tooltips={{
              pendingCommission: "As of Available cutoff period",
            }}
          />
        </div>
        <DataTable
          columns={financialOverviewColumns}
          data={financialOverviewData}
          columnWidths={["250px", "250px", "250px", "250px"]}
          tooltips={{
            pendingCommission: "As of Available cutoff period",
          }}
        />
      </div>
      <div className="mb-4">
        <TypographyH2 className="mb-2">Per Category</TypographyH2>
        <TypographyH4 className="mb-2">E-Games</TypographyH4>
        <DataTable
          columns={categoryFinancialOverviewColumns}
          data={categoryFinancialOverviewData}
          columnWidths={["250px", "250px", "250px", "250px", "150px"]}
          tooltips={{
            pendingCommission: "As of Available cutoff period",
          }}
        />
      </div>
      <div className="mb-10">
        <TypographyH4 className="mb-2">Sports Betting</TypographyH4>
        <DataTable
          columns={sportsBettingOverviewColumns}
          data={sportsBettingOverviewData}
          columnWidths={["250px", "250px", "250px", "250px", "150px"]}
          tooltips={{
            pendingCommission: "As of Available cutoff period",
          }}
        />
      </div>
      <div className="mb-10">
        <TypographyH2 className="mb-2">Top Performers</TypographyH2>
        <TypographyH4 className="mb-2">All Time</TypographyH4>
        <DataTable
          columns={topPerformersColumns}
          data={topPerformersData}
          columnWidths={["250px", "250px", "250px"]}
          tooltips={{
            pendingCommission: "As of Available cutoff period",
          }}
        />
        <div className="mt-4">
          <TypographyH4 className="mb-2">Per Cutoff</TypographyH4>
          <DataTable
            columns={topPerformersColumns}
            data={topPerformersDataPerCutoff}
            columnWidths={["250px", "250px", "250px"]}
            tooltips={{
              pendingCommission: "As of Available cutoff period",
            }}
          />
        </div>
      </div>
      <div className="mb-10">
        <TypographyH2 className="mb-2">Top Players</TypographyH2>
        <TypographyH4 className="mb-2">Deposits</TypographyH4>
        <DataTable
          columns={topPlayersDepositsColumns}
          data={topPlayersDepositsData}
          columnWidths={["250px", "250px", "250px", "250px"]}
        />
        <div className="mt-4">
          <TypographyH4 className="mb-2">GGR</TypographyH4>
          <DataTable
            columns={topPlayersGGRColumns}
            data={topPlayersGGRData}
            columnWidths={["250px", "250px", "250px", "250px"]}
            tooltips={{
              pendingCommission: "As of Available cutoff period",
            }}
          />
        </div>
      </div>
    </div>
  );
}
