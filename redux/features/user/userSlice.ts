import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { User } from "@/lib/types";
import { BASE_URL } from "@/redux/baseUrl";
import { SignUpInput } from "@/lib/validation/signupSchema";

//
// Types
//
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface UserState {
  currentUser: User | null;
  token: string | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: UserState = {
  currentUser: null,
  token: null,
  users: [],
  loading: false,
  error: null,
};

export const signUp = createAsyncThunk<User, SignUpInput>(
  "users/signup",
  async (formData, { rejectWithValue }) => {
    try {
      // remove confirmPassword
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

export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  "users/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/user/login`,
        credentials
      );
      const { token, user } = response.data.data;
      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token, user };
    } catch (error: unknown) {
      let errorMessage = "Login failed";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

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

export const updateUser = createAsyncThunk<User, Partial<User>>(
  "users/update",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/user/update-user/${userData.id}`,
        userData
      );
      return response.data.data as User;
    } catch (error: unknown) {
      let errorMessage = "Update failed";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

//
// Slice
//
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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

      // Fetch All Users
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
        if (index >= 0) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
