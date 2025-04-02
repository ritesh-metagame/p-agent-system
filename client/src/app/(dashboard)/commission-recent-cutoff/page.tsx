import RoleBasedContent from "@/components/role-based-content";
import { Pages } from "@/lib/constants";
import React from "react";

type Props = {};

export default async function CommissionRecentCutoffPage({}: Props) {
  return <RoleBasedContent page={Pages.COMMISSION_RECENT_CUTOFF} />;
}
