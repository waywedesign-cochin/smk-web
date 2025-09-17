import { BASE_URL } from "@/redux/baseUrl";
import { Course } from "@/components/student/course/AddCourseDialog";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface CourseState {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  loading: false,
  error: null,
};

// Async thunk - fetch courses from backend

export const fetchCourses = createAsyncThunk<Course[]>(
  "courses/getAll", // action type string - should be unique across your app

  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/course/get-courses`);
      return response.data.data as Course[];
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch courses";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // builder is automatically typed as ActionReducerMapBuilder<CourseState>
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload; // payload is automatically typed as Course[]
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch courses";
      });
  },
});

export default courseSlice.reducer;
