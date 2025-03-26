"use client";

import { RootState, store, useDispatch, useSelector } from "@/redux/store";
import { ThemeProvider } from "./theme-provider";
import ReduxProvider from "@/redux/redux-provider";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import {
  clearAuthLoading,
  setAuthLoading,
  setRole,
  setUsername,
} from "@/redux/slices/auth-slice";
import { redirect, useRouter } from "next/navigation";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ReduxProvider>{children}</ReduxProvider>
    </ThemeProvider>
  );
}
