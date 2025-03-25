import RoleBasedContent from "@/components/role-based-content";
import { Pages } from "@/lib/constants";
import React from "react";

type Props = {};

export default function Page({}: Props) {
  return <RoleBasedContent page={Pages.TRANSACTIONS} />;
}
