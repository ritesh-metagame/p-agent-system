"use client";

import RoleBasedContent from "@/components/role-based-content";
import { Pages } from "@/lib/constants";
import React from "react";

type Props = {};

export default function PartnerManagementPage({}: Props) {
  return (
    <div>
      <RoleBasedContent page={Pages.PARTNER_MANAGEMENT} />
    </div>
  );
}
