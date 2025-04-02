import SettlementHistory from "@/components/tables/common/common-downloadReports-components/common-settlement-history";
import React from "react";

type Props = {};

export default async function SuperAdminSettlementHistory({}: Props) {
  const response = await fetch("");
  const responseJson = await response.json();

  const settlementHistoryData = responseJson.settlementHistoryData || [];

  return (
    <div>
      <SettlementHistory />
    </div>
  );
}
