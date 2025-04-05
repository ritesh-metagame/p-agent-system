"use client";

import { UserRole, Pages, RolePageComponentMap } from "@/lib/constants";
import { useSelector } from "@/redux/store";
import { getCookie } from "cookies-next/client";
interface RoleBasedContentProps {
  page: Pages;
}

const RoleBasedContent = ({ page }: RoleBasedContentProps) => {
  // const role = "super-admin";
  // const role = getCookie("role") || UserRole.DEFAULT;
  const role = useSelector((state) => state.authReducer.role);

  const Component =
    RolePageComponentMap[role]?.[page] ||
    RolePageComponentMap[UserRole.DEFAULT]?.[page];

  return Component ? <Component /> : <p>Unauthorized Access</p>;
};

export default RoleBasedContent;
