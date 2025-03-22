import * as React from "react";

import { SearchForm } from "@/components/search-form";
import { VersionSwitcher } from "@/components/version-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { headers } from "next/headers";
import path from "path";

// This is sample data.
const data = {
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
          title: "Create Operator Account",
          url: "/create-operator-account",
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

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const hs = await headers();
  const host = hs.get("host");
  const pathname = host ? hs.get("referer")?.split(host, 2)[1] : undefined;

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}

      <SidebarRail />
    </Sidebar>
  );
}
