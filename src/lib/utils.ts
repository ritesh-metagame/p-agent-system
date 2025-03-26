import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserRole } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSidebarMenusBasedOnRole(role: UserRole) {
  return {
    versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "General",
        url: "#",
        items: [
          {
            title: "Dashboard",
            url: "/dashboard",
          },
        ],
      },
      {
        title: "Network",
        url: "#",
        items: [
          {
            title:
              role == UserRole.SUPER_ADMIN
                ? "Create Operator Account"
                : role == UserRole.PLATINUM
                ? "Create Gold Account"
                : role == UserRole.OPERATOR
                ? "Create Platinum Account"
                : role == UserRole.GOLD
                ? "Create Player"
                : "Create Account",
            url: "/create-account",
          },
          {
            title: "Partner Management",
            url: "/partner-management",
            isActive: true,
          },
        ],
      },
      {
        title: "Commission Release",
        url: "#",
        items: [
          {
            title: "Commission Recent Cutoff",
            url: "/commission-recent-cutoff",
          },
          {
            title: "Historical Cutoffs",
            url: "/historical-cutoffs",
          },
        ],
      },
      {
        title: "Download Reports",
        url: "#",
        items: [
          {
            title: "Transactions",
            url: "/transactions",
          },
          {
            title: "Commissions",
            url: "/commissions",
          },
          {
            title: "Settlement History",
            url: "/settlement-history",
          },
        ],
      },
    ],
  };
}
