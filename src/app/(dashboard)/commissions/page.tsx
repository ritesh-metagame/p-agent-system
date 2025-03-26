import RoleBasedContent from "@/components/role-based-content";
import { Pages } from "@/lib/constants";

export default function Page() {
  return <RoleBasedContent page={Pages.COMMISSIONS} />;
}
