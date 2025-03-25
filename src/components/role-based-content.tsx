import { UserRole, Pages, RolePageComponentMap } from "@/lib/constants";
import { RootState, useSelector } from "@/redux/store";
interface RoleBasedContentProps {
  page: Pages;
}

const RoleBasedContent = ({ page }: RoleBasedContentProps) => {
  const role = useSelector(
    (state: RootState) => state.authReducer.role as UserRole
  );

  if (!role) return <>Loading...</>;

  const ComponentToRender =
    RolePageComponentMap[role]?.[page] ||
    RolePageComponentMap[UserRole.DEFAULT]?.[page];

  return ComponentToRender ? <ComponentToRender /> : <p>Unauthorized Access</p>;
};

export default RoleBasedContent;
