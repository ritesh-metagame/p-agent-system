import { Draft, PayloadAction, createSlice } from "@reduxjs/toolkit";

import axios from "axios";
import { store } from "../store";

// Define the state type
interface AuthState {
  role: string | null;
}

// Initial state
const initialState: AuthState = {
  role: null,
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
    },
    clearRole: (state) => {
      state.role = null;
    },
  },
});

export const { setRole, clearRole } = authSlice.actions;

export default authSlice.reducer;
