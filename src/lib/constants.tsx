import CreateAccountForm from "@/components/create-account-form";
import {
  OperatorDashboard,
  PlatinumDashboard,
  SuperAdminCommissionRecentCutoff,
  SuperAdminCreateOperatorAccount,
  SuperAdminDashboard,
  SuperAdminPartnerManagement,
  PlatinumPartnerManagement,
  PlatinumCommissionRecentCutoff,
  PlatinumHistoricalCutoff,
  PlatinumCommissions,
  PlatinumTransactions,
  PlatinumSettlementHistory,
  CreateGoldenAccount,
  GoldenCommissions,
  GoldenTransactions,
  GoldenSettlementHistory,
  SuperAdminSettlementHistory,
  SuperAdminCommissions,
  SuperAdminTransactions,
  OperatorCommissions,
  OperatorSettlementHistory,
  OperatorTransactions,
  GoldenDashboard,
  GoldenCommissionRecentCutoff,
  GoldenCreateOperatorAccount,
  GoldenPartnerManagement,
  SuperAdminAllCommissionCutoffs,
  GoldenAllCommissionCutoff,
  OperatorAllCommissionCutoff,
} from "@/components/screens";
import CommissionRecentCutsOff from "@/components/screens/operator/commission-recent-cutoff";
import PartnerManagement from "@/components/screens/operator/partner-management";
// import { OperatorDashboard } from "@/components/screens";
import { JSX } from "react";

export enum UserRole {
  SUPER_ADMIN = "super-admin",
  OPERATOR = "operator",
  PLATINUM = "platinum",
  GOLD = "golden",
  DEFAULT = "default",
}

export enum Pages {
  DASHBOARD = "Dashboard",
  CREATE_OPERATOR_ACCOUNT = "Create Account",
  PARTNER_MANAGEMENT = "Partner Management",
  COMMISSION_RECENT_CUTOFF = "Commission Recent Cutoff",
  HISTORICAL_CUTOFFS = "All Commission Cutoffs",
  TRANSACTIONS = "Transactions",
  COMMISSIONS = "Commissions",
  SETTLEMENT_HISTORY = "Settlement History",
}

export enum Paths {
  DASHBOARD = "/dashboard",
  CREATE_OPERATOR_ACCOUNT = "/create-account",
  PARTNER_MANAGEMENT = "/partner-management",
  COMMISSION_RECENT_CUTOFF = "/commission-recent-cutoff",
  HISTORICAL_CUTOFFS = "/all-commission-cutoffs",
  TRANSACTIONS = "/transactions",
  COMMISSIONS = "/commissions",
  SETTLEMENT_HISTORY = "/settlement-history",
}

export const pagePaths = new Map<Paths, Pages>([
  [Paths.DASHBOARD, Pages.DASHBOARD],
  [Paths.CREATE_OPERATOR_ACCOUNT, Pages.CREATE_OPERATOR_ACCOUNT],
  [Paths.PARTNER_MANAGEMENT, Pages.PARTNER_MANAGEMENT],
  [Paths.COMMISSION_RECENT_CUTOFF, Pages.COMMISSION_RECENT_CUTOFF],
  [Paths.HISTORICAL_CUTOFFS, Pages.HISTORICAL_CUTOFFS],
  [Paths.TRANSACTIONS, Pages.TRANSACTIONS],
  [Paths.COMMISSIONS, Pages.COMMISSIONS],
]);

export const users = [
  {
    id: "1",
    username: "example1",
    role: UserRole.SUPER_ADMIN,
    password: "password",
  },
  {
    id: "2",
    username: "example2",
    role: UserRole.PLATINUM,
    password: "password",
  },
  {
    id: "3",
    username: "example3",
    role: UserRole.GOLD,
    password: "password",
  },
  {
    id: "4",
    username: "example4",
    role: UserRole.DEFAULT,
    password: "password",
  },
  {
    id: "5",
    username: "example5",
    role: UserRole.OPERATOR,
    password: "password",
  },
];

export type RolePageMap = {
  [key in UserRole]: {
    [key in Pages]?: () => JSX.Element;
  };
};

export const RolePageComponentMap: RolePageMap = {
  [UserRole.SUPER_ADMIN]: {
    [Pages.DASHBOARD]: () => <SuperAdminDashboard />,
    [Pages.CREATE_OPERATOR_ACCOUNT]: () => <SuperAdminCreateOperatorAccount />,
    [Pages.PARTNER_MANAGEMENT]: () => <SuperAdminPartnerManagement />,
    [Pages.COMMISSION_RECENT_CUTOFF]: () => (
      <SuperAdminCommissionRecentCutoff />
    ),

    [Pages.HISTORICAL_CUTOFFS]: () => <SuperAdminAllCommissionCutoffs />,
    [Pages.TRANSACTIONS]: () => <SuperAdminTransactions />,
    [Pages.COMMISSIONS]: () => <SuperAdminCommissions />,
    [Pages.SETTLEMENT_HISTORY]: () => <SuperAdminSettlementHistory />,
  },
  [UserRole.PLATINUM]: {
    [Pages.DASHBOARD]: () => <PlatinumDashboard />,
    [Pages.CREATE_OPERATOR_ACCOUNT]: () => <CreateGoldenAccount />,
    [Pages.PARTNER_MANAGEMENT]: () => <PlatinumPartnerManagement />,
    [Pages.COMMISSION_RECENT_CUTOFF]: () => <PlatinumCommissionRecentCutoff />,
    [Pages.HISTORICAL_CUTOFFS]: () => <PlatinumHistoricalCutoff />,
    [Pages.TRANSACTIONS]: () => <PlatinumTransactions />,
    [Pages.COMMISSIONS]: () => <PlatinumCommissions />,
    [Pages.SETTLEMENT_HISTORY]: () => <PlatinumSettlementHistory />,
  },

  [UserRole.GOLD]: {
    [Pages.HISTORICAL_CUTOFFS]: () => <GoldenAllCommissionCutoff />,
    [Pages.TRANSACTIONS]: () => <GoldenTransactions />,
    [Pages.COMMISSIONS]: () => <GoldenCommissions />,
    [Pages.SETTLEMENT_HISTORY]: () => <GoldenSettlementHistory />,
    [Pages.DASHBOARD]: () => <GoldenDashboard />,
    [Pages.CREATE_OPERATOR_ACCOUNT]: () => <GoldenCreateOperatorAccount />,
    [Pages.PARTNER_MANAGEMENT]: () => <GoldenPartnerManagement />,
    [Pages.COMMISSION_RECENT_CUTOFF]: () => <GoldenCommissionRecentCutoff />,
  },
  [UserRole.OPERATOR]: {
    [Pages.DASHBOARD]: () => <OperatorDashboard />,
    [Pages.CREATE_OPERATOR_ACCOUNT]: () => <CreateAccountForm />,
    [Pages.PARTNER_MANAGEMENT]: () => <PartnerManagement />,
    [Pages.COMMISSION_RECENT_CUTOFF]: () => <CommissionRecentCutsOff />,
    [Pages.HISTORICAL_CUTOFFS]: () => <OperatorAllCommissionCutoff />,

    [Pages.TRANSACTIONS]: () => <OperatorTransactions />,
    [Pages.COMMISSIONS]: () => <OperatorCommissions />,
    [Pages.SETTLEMENT_HISTORY]: () => <OperatorSettlementHistory />,
  },
  [UserRole.DEFAULT]: {
    [Pages.DASHBOARD]: () => <></>,
    [Pages.CREATE_OPERATOR_ACCOUNT]: () => <></>,
    [Pages.PARTNER_MANAGEMENT]: () => <></>,
    [Pages.COMMISSION_RECENT_CUTOFF]: () => <></>,
    [Pages.HISTORICAL_CUTOFFS]: () => <></>,
    [Pages.TRANSACTIONS]: () => <></>,
    [Pages.COMMISSIONS]: () => <></>,
    [Pages.SETTLEMENT_HISTORY]: () => <></>,
  },
};
