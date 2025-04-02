import { UserRole, Pages, RolePageComponentMap } from "@/lib/constants";
import { getCookie } from "cookies-next/client";
interface RoleBasedContentProps {
  page: Pages;
}

const RoleBasedContent = async ({ page }: RoleBasedContentProps) => {
  const role = "super-admin";

  const Component =
    RolePageComponentMap[role]?.[page] ||
    RolePageComponentMap[UserRole.DEFAULT]?.[page];

  return Component ? <Component /> : <p>Unauthorized Access</p>;
};

export default RoleBasedContent;
