import { UserRole, Page } from "@/lib/constants";
import { RootState, useSelector } from "@/redux/store";
import { JSX } from "react";

type RolePageMap = {
  [key in UserRole]: {
    [key in Page]?: () => JSX.Element;
  };
};

const RolePageComponentMap: RolePageMap = {
  [UserRole.SUPER_ADMIN]: {
    [Page.DASHBOARD]: () => <></>,
  },
  [UserRole.PLATINUM_USER]: {
    [Page.DASHBOARD]: () => <></>,
  },
  [UserRole.GOLD_USER]: {
    [Page.DASHBOARD]: () => <></>,
  },
  [UserRole.DEFAULT]: {
    [Page.DASHBOARD]: () => <></>,
  },
};

interface RoleBasedContentProps {
  page: Page;
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
