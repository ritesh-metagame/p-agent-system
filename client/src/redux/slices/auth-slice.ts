import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { store } from "../store";
import { UserRole, users } from "@/lib/constants";

import { setCookie } from "cookies-next/client";

// Define the state type
interface AuthState {
  authLoading: boolean;
  role: string | null;
  username: string | null;
}

// Initial state
const initialState: AuthState = {
  authLoading: true,
  role: UserRole?.DEFAULT ?? "defaultOperator",
  username: null,
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
    },

    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.authLoading = action.payload;
    },
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    clearUsername: (state) => {
      state.username = null;
    },
    clearRole: (state) => {
      state.role = null;
    },
    clearAuthLoading: (state) => {
      state.authLoading = false;
    },
  },
});

export const {
  setRole,
  clearRole,
  setUsername,
  clearUsername,
  setAuthLoading,
  clearAuthLoading,
} = authSlice.actions;

// Thunk
export const login =
  (username: string, password: string) =>
  async (dispatch: typeof store.dispatch) => {
    try {
      const user = await new Promise<{
        username: string;
        password: string;
        role: string;
      } | null>((resolve) => {
        setTimeout(() => {
          const user = users.find(
            (user) => user.username === username && user.password === password
          );
          if (user) {
            resolve(user);
          } else {
            resolve(null);
          }
        }, 500);
      });

      if (user) {
        dispatch(setUsername(user.username));
        dispatch(setRole(user.role));

        localStorage.setItem("username", user.username);
        localStorage.setItem("role", user.role);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

export default authSlice.reducer;
