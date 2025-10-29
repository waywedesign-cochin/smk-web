import { Course } from "@/lib/types";
import { BASE_URL } from "@/redux/baseUrl";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

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

export const addCourse = createAsyncThunk<Course, Course>(
  "courses/add",
  async (newCourse, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${BASE_URL}/api/course/add-course`,
        newCourse,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Course added successfully");
      }
      return response.data.data as Course;
    } catch (error: unknown) {
      let errorMessage = "Failed to add course";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCourse = createAsyncThunk<Course, Course>(
  "courses/update",
  async (updatedCourse, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `${BASE_URL}/api/course/update-course/${updatedCourse.id}`,
        updatedCourse,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Course updated successfully");
      }
      return response.data.data as Course;
    } catch (error: unknown) {
      let errorMessage = "Failed to update course";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCourse = createAsyncThunk<string, string>(
  "courses/delete",
  async (courseId, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/course/delete-course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Course deleted successfully");
      }
      return courseId;
    } catch (error: unknown) {
      let errorMessage = "Failed to delete course";
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
    builder
      .addCase(addCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = [action.payload, ...state.courses];
      })
      .addCase(addCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add course";
      });

    builder
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.map((course) =>
          course.id === action.payload.id ? action.payload : course
        );
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update course";
      });
    builder
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter(
          (course) => course.id !== action.payload
        );
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete course";
      });
  },
});

export default courseSlice.reducer;
