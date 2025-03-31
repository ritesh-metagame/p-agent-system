export type NetworkOverview = {
  network: string;
  approved: number;
  pending: number;
  suspended: number;
  summary: number;
};

export type CommonDashboardProps = {
  welcomeTierName: string;
  referralLink: string;
  networkOverviewData: NetworkOverview[];
};
