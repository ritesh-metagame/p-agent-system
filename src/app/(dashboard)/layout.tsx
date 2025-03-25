import { AppSidebar } from "@/components/app-sidebar";
import PageHeader from "@/components/page-header";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageHeader />
        <ScrollArea className={"md:w-[calc(100vw-16rem)] w-[calc(100vw-16px)]"}>
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="pl-10 pt-10 pr-10 pb-10">{children}</div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
