import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { store } from "../store";
import { UserRole, users } from "@/lib/constants";

// Define the state type
interface AuthState {
  role: string | null;
  username: string | null;
}

// Initial state
const initialState: AuthState = {
  role: UserRole.OPERATOR,
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
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    clearUsername: (state) => {
      state.username = null;
    },
    clearRole: (state) => {
      state.role = null;
    },
  },
});

export const { setRole, clearRole, setUsername, clearUsername } =
  authSlice.actions;

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
        }, 2000);
      });

      if (user) {
        dispatch(setUsername(user.username));
        dispatch(setRole(user.role));
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
