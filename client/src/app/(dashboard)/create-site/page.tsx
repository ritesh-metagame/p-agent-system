import RoleBasedContent from "@/components/role-based-content";
import { Pages } from "@/lib/constants";
import React from "react";

type Props = {};

export default async function CreateSitePage({}: Props) {
  // background: linear-gradient(113.67deg, #0A615B 24.24%, #01B1A4 77.42%);

  return (
    <div>
      <RoleBasedContent page={Pages.CREATE_SITE} />
    </div>
  );
}
