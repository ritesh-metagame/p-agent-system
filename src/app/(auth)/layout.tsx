"use client";

import {
  clearAuthLoading,
  setRole,
  setUsername,
} from "@/redux/slices/auth-slice";
import { store } from "@/redux/store";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  const { authLoading } = store.getState().authReducer;

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") return;

    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (!role || !username) {
      store.dispatch(clearAuthLoading());
    }

    store.dispatch(setRole(role));
    store.dispatch(setUsername(username));
  }, []);

  return <div>{children}</div>;
}
