import { UserRole, Pages, RolePageComponentMap } from "@/lib/constants";
import { RootState, store, useSelector } from "@/redux/store";
interface RoleBasedContentProps {
  page: Pages;
}

const RoleBasedContent = ({ page }: RoleBasedContentProps) => {
  const role = store.getState().authReducer.role as UserRole;
  if (!role) return <>Loading...</>;

  const Component =
    RolePageComponentMap[role]?.[page] ||
    RolePageComponentMap[UserRole.DEFAULT]?.[page];

  return Component ? <Component /> : <p>Unauthorized Access</p>;
};

export default RoleBasedContent;
