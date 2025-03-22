"use client";

import { store } from "@/redux/store";
import { ThemeProvider } from "./theme-provider";
import ReduxProvider from "@/redux/redux-provider";

export function Provider({ children }: { children: React.ReactNode }) {
  //   const { accessToken } = store.getState().authReducer;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ReduxProvider>{children}</ReduxProvider>
    </ThemeProvider>
  );
}
