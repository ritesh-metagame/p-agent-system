import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the types for the data structure
interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface UserSite {
  userId: string;
  siteId: string;
  assignedAt: string;
}

interface Commission {
  // Define commission properties when needed
  id?: string;
}

interface User {
  id: string;
  username: string;
  password: string;
  roleId: string;
  affiliateLink: string;
  firstName: string | null;
  lastName: string | null;
  mobileNumber: string | null;
  bankName: string | null;
  accountNumber: string | null;
  parentId: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
  commissions: Commission[];
  userSites: UserSite[];
  children: User[];
}

// Define the state type
interface UserState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

// Define initial state
const initialState: UserState = {
  currentUser: null,
  users: [],
  loading: false,
  error: null,
};

// Create the slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Get all users
    pushUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
  },
});

// Export actions and reducer
export const { pushUsers } = userSlice.actions;

export default userSlice.reducer;
