import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { User } from "@/lib/types";
import { BASE_URL } from "@/redux/baseUrl";
import { SignUpInput } from "@/lib/validation/signupSchema";

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface UserState {
  currentUser: User | null;
  users: User[];
  token: string | null;
  loading: boolean;
  error: string | null;
}
interface FetchUsersParams {
  search?: string;
  role?: number;
}

// Initial State
const initialState: UserState = {
  currentUser: null,
  users: [],
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  loading: false,
  error: null,
};

// Signup
export const signUp = createAsyncThunk<User, SignUpInput>(
  "users/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const { confirmPassword, ...payload } = formData;
      const response = await axios.post(`${BASE_URL}/api/user/signup`, payload);
      if (response.data.success) {
        toast.success(response.data.message || "Signup successful, login now");
      }
      return response.data.data as User;
    } catch (error: unknown) {
      let errorMessage = "Signup failed";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// Login
export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  "users/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/user/login`,
        credentials
      );
      const { token } = response.data.data;
      localStorage.setItem("token", token);
      toast.success("Login successful");
      return response.data.data as LoginResponse;
    } catch (error: unknown) {
      let errorMessage = "Login failed";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout
export const logoutUser = createAsyncThunk(
  "users/logout",
  async (_, { dispatch }) => {
    localStorage.removeItem("token");
    dispatch(userSlice.actions.clearUser());
    toast.success("Logged out successfully");
    return true;
  }
);

// Fetch Current User
export const fetchCurrentUser = createAsyncThunk<User>(
  "users/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(`${BASE_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data as User;
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch current user";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch All Users
export const fetchUsers = createAsyncThunk<User[]>(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user/get-users`);

      return response.data.data as User[];
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch users";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch User By Id
export const fetchUserById = createAsyncThunk<User, string>(
  "users/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user/get-user/${id}`);
      return response.data.data as User;
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch user";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// Update User
export const updateUser = createAsyncThunk<User, Partial<User>>(
  "users/update",
  async (userData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.put(
        `${BASE_URL}/api/user/update-user/${userData.id}`,
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data.data as User;
    } catch (error: unknown) {
      let errorMessage = "Update failed";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);
export const deleteUser = createAsyncThunk<string, string>(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await axios.delete(
        `${BASE_URL}/api/user/delete-user/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success(response.data.message || "User deleted successfully");
      }
      return id;
    } catch (error: unknown) {
      let errorMessage = "Delete failed";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);
// Slice
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUser(state) {
      state.currentUser = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.currentUser = action.payload.user;
          state.token = action.payload.token;
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.token = null;
      })

      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.currentUser = action.payload;
        }
      )
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch User By Id
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserById.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.currentUser = action.payload;
        }
      )
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index >= 0) state.users[index] = action.payload;
        if (state.currentUser?.id === action.payload.id)
          state.currentUser = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete User
    builder.addCase(deleteUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      deleteUser.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
      }
    );
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
