import { AppSidebar } from "@/components/app-sidebar";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import PageHeader from "@/components/page-header";
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
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
