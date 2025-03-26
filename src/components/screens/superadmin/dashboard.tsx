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

// type Props = {};

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

export const financialOverviewData: FinancialOverview[] = [
  {
    item: "TOTAL BETS",
    pendingCommission: 1256789.45,
    releasedAllTime: 5847623.78,
    totalSummary: 7104413.23,
  },
  {
    item: "TOTAL WINNINGS",
    pendingCommission: 876543.21,
    releasedAllTime: 3254789.9,
    totalSummary: 4131333.11,
  },
  {
    item: "TOTAL GGR",
    pendingCommission: 380246.24,
    releasedAllTime: 2592833.88,
    totalSummary: 2973080.12,
  },
  {
    item: "TOTAL GROSS COMMISSIONS",
    pendingCommission: 76049.25,
    releasedAllTime: 518566.78,
    totalSummary: 594616.03,
  },
  {
    item: "TOTAL DEDUCTIONS\n(Payment Gateway Fee Deductions from GP Comissions)",
    pendingCommission: 7604.93,
    releasedAllTime: 51856.68,
    totalSummary: 59461.61,
  },
  {
    item: "NET COMMISSIONS FOR OPERATORS",
    pendingCommission: 68444.32,
    releasedAllTime: 466710.1,
    totalSummary: 535154.42,
  },
];

const topPlayersDepositsData: TopPlayersDepositsOverview[] = [
  {
    playerName: "Juan dela Cruz",
    depositsMade: 1000,
    totalDeposits: 5000,
    operatorName: "Operator A",
  },
];
const topPlayersGGRData: TopPlayersGGROverview[] = [
  {
    playerName: "Juan dela Cruz",
    ggrMade: 2000,
    totalGGR: 10000,
    operatorName: "Operator B",
  },
];

export const categoryFinancialOverviewData: CategoryFinancialOverview[] = [
  {
    item: "TOTAL BETS",
    dailyOverview: 245890,
    pendingCommission: 12450,
    releasedAllTime: 567800,
    totalSummary: 580250,
  },
  {
    item: "TOTAL WINNINGS",
    dailyOverview: 98760,
    pendingCommission: 4930,
    releasedAllTime: 287600,
    totalSummary: 292530,
  },
  {
    item: "TOTAL LOSSES",
    dailyOverview: 147130,
    pendingCommission: 7520,
    releasedAllTime: 280200,
    totalSummary: 287720,
  },
  {
    item: "CASINO GAMES",
    dailyOverview: 78450,
    pendingCommission: 3922.5,
    releasedAllTime: 178900,
    totalSummary: 182822.5,
  },
  {
    item: "SPORTS BETTING",
    dailyOverview: 167440,
    pendingCommission: 8372,
    releasedAllTime: 388900,
    totalSummary: 397272,
  },
  {
    item: "PROMOTIONAL BONUSES",
    dailyOverview: "N/A",
    pendingCommission: 1500,
    releasedAllTime: 35000,
    totalSummary: 36500,
  },
  {
    item: "PLATFORM FEES",
    dailyOverview: 3200,
    pendingCommission: 0,
    releasedAllTime: 48500,
    totalSummary: 48500,
  },
];

const sportsBettingOverviewData: SportsBettingOverview[] = [
  {
    item: "TOTAL BETS",
    dailyOverview: 5000,
    pendingCommission: 2000,
    releasedAllTime: 15000,
    totalSummary: 17000,
  },
  {
    item: "TOTAL GROSS COMMISSIONS % of Total Bets",
    dailyOverview: "N/A",
    pendingCommission: 500,
    releasedAllTime: 3000,
    totalSummary: 3500,
  },
];

const topPerformersData: TopPerformersOverview[] = [
  {
    operatorName: "ETA-001",
    pendingCommission: 1000,
    releasedAllTime: 5000,
  },
  {
    operatorName: "ETA-002",
    pendingCommission: 2000,
    releasedAllTime: 7000,
  },
  {
    operatorName: "ETA-003",
    pendingCommission: 1500,
    releasedAllTime: 6000,
  },
];

const topPerformersDataPerCutoff: TopPerformersOverview[] = [
  {
    operatorName: "ETA-001",
    pendingCommission: 1000,
    releasedAllTime: 5000,
  },
];

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
              pendingCommission: "The total amount of pending commissions",
            }}
          />
        </div>
        <DataTable
          columns={financialOverviewColumns}
          data={financialOverviewData}
          columnWidths={["250px", "250px", "250px", "250px"]}
          tooltips={{
            pendingCommission: "The total amount of pending commissions",
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
            pendingCommission: "The total amount of pending commissions",
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
            pendingCommission: "The total amount of pending commissions",
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
            pendingCommission: "The total amount of pending commissions",
          }}
        />
        <div className="mt-4">
          <TypographyH4 className="mb-2">Per Cutoff</TypographyH4>
          <DataTable
            columns={topPerformersColumns}
            data={topPerformersDataPerCutoff}
            columnWidths={["250px", "250px", "250px"]}
            tooltips={{
              pendingCommission: "The total amount of pending commissions",
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
              pendingCommission: "The total amount of pending commissions",
            }}
          />
        </div>
      </div>
    </div>
  );
}
