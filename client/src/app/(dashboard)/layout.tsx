"use client";

import { AppSidebar } from "@/components/app-sidebar";
import PageHeader from "@/components/page-header";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  clearAuthLoading,
  setAuthLoading,
  setRole,
  setUser,
  setUsername,
} from "@/redux/slices/auth-slice";
import { RootState, useDispatch } from "@/redux/store";
import { useGetCookie } from "cookies-next/client";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { authLoading } = useSelector((state: RootState) => state.authReducer);

  const getCookie = useGetCookie();

  const router = useRouter();

  const dispatch = useDispatch();

  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role");
      const username = localStorage.getItem("username");
      const user = localStorage.getItem("user");

      console.log({ role, username });

      if (role) {
        dispatch(setRole(role));
      }

      if (username) {
        dispatch(setUsername(username));
      }

      if (user) {
        dispatch(setUser(JSON.parse(user) as any));
      }

      dispatch(setAuthLoading(false));

      if (pathname !== "/login" && pathname !== "/dashboard") {
        router.push(pathname);
      } else {
        router.push("/dashboard");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role");
      const username = localStorage.getItem("username");

      if (!role || !username) {
        dispatch(clearAuthLoading());
        router.push("/login");
      }
    }
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="">
        {authLoading ? (
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            <PageHeader />
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <div className="pl-10 pt-10 pr-10 pb-10">
                <>{children}</>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
