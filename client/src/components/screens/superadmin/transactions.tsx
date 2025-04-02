import Transactions from "@/components/tables/common/common-downloadReports-components/common-transactions";
import React from "react";

type Props = {};

export default async function SuperAdminTransactions({}: Props) {
  const response = await fetch("");
  const responseJson = await response.json();

  const transactionsData = responseJson.transactionsData || [];

  return (
    <div>
      <Transactions />
    </div>
  );
}
