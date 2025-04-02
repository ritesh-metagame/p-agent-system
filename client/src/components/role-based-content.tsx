import { UserRole, Pages, RolePageComponentMap } from "@/lib/constants";
import { cookies } from "next/headers";
import { getCookie } from "cookies-next/server";
interface RoleBasedContentProps {
  page: Pages;
}

const RoleBasedContent = async ({ page }: RoleBasedContentProps) => {
  const role = getCookie("role") as unknown as UserRole;

  const Component =
    RolePageComponentMap[role]?.[page] ||
    RolePageComponentMap[UserRole.DEFAULT]?.[page];

  return Component ? <Component /> : <p>Unauthorized Access</p>;
};

export default RoleBasedContent;
