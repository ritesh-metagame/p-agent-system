"use client";

import * as React from "react";

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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ChevronRight, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { RootState, store, useSelector } from "@/redux/store";
import Link from "next/link";
import { UserRole } from "@/lib/constants";
import { generateSidebarMenusBasedOnRole } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const { authLoading, role } = useSelector(
    (state: RootState) => state.authReducer
  );

  return (
    <Sidebar {...props}>
      {authLoading ? (
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          <SidebarHeader>
            <NavUser
              user={generateSidebarMenusBasedOnRole(role as UserRole).user}
            />
            {/* <SearchForm /> */}
          </SidebarHeader>
          <SidebarContent className="gap-0">
            {generateSidebarMenusBasedOnRole(role as UserRole).navMain.map(
              (item) => (
                <Collapsible
                  key={item.title}
                  title={item.title}
                  defaultOpen
                  className="group/collapsible"
                >
                  <SidebarGroup>
                    <SidebarGroupLabel
                      asChild
                      className="group/label text-sm text-green-900 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <CollapsibleTrigger>
                        {item.title}{" "}
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {item.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                className={`text-green `}
                                asChild
                                isActive={item.url === pathname}
                              >
                                <Link href={item.url}>{item.title}</Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              )
            )}
          </SidebarContent>
        </>
      )}

      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}

      <SidebarRail />
    </Sidebar>
  );
}
