import Commissions from "@/components/tables/common/common-downloadReports-components/common-commissions";
import React from "react";

type Props = {};

export default async function SuperAdminCommissions({}: Props) {
  const response = await fetch("");
  const responseJson = await response.json();

  const commissionsData = responseJson.commissionsData || [];

  return (
    <div>
      <Commissions />
    </div>
  );
}
