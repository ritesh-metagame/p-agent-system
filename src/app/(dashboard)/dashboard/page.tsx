import RoleBasedContent from "@/components/role-based-content";
import { Pages } from "@/lib/constants";

import {
  platinumcutoffPeriodColumns,
  platinumeGamesColumns,
  platinumnetworkOverviewColumns,
  platinumoverallSummaryColumns,
  platinumsportsbettingColumns,
  platinumtopPerformersAllTimeColumns,
  platinumtopPerformersPerCutoffColumns,
  PlatinumCutoffPeriodData,
  PlatinumEGamesData,
  PlatinumNetworkOverviewData,
  PlatinumOverallSummaryData,
  PlatinumSportsbettingData,
  PlatinumTopPerformersAllTimeData,
  PlatinumTopPerformersPerCutoffData
} from "../../../components/tables/platinum/general/dashboard-columns";



export default function Page() {
  return <RoleBasedContent page={Pages.DASHBOARD} />;
}
