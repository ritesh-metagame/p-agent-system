import RoleBasedContent from "@/components/role-based-content";
import { Pages } from "@/lib/constants";

export default async function Page() {
  return <RoleBasedContent page={Pages.DASHBOARD} />;
}
