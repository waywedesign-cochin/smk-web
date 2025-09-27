import { Student } from "@/lib/types";
import { BASE_URL } from "@/redux/baseUrl";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

// ------------------ Types ------------------
interface Pagination {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

interface StudentsResponse {
  students: Student[];
  pagination: Pagination;
}

interface StudentState {
  students: Student[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

interface FetchStudentsParams {
  search?: string;
  isFundedAccount?: true | false;
}

// ------------------ Initial State ------------------
const initialState: StudentState = {
  students: [],
  pagination: null,
  loading: false,
  error: null,
};

// ------------------ Async Thunks ------------------
export const addStudent = createAsyncThunk<Student, Student>(
  "student/add",
  async (newStudent, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/student/add-student`,
        newStudent
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Student added successfully");
      }
      return response.data.data as Student;
    } catch (error: unknown) {
      let errorMessage = "Failed to add student";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchStudents = createAsyncThunk<
  StudentsResponse,
  FetchStudentsParams | undefined
>("students/fetch", async (params, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/student/get-students`, {
      params: params || {},
    });
    return response.data.data as StudentsResponse;
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch students";
    if (error instanceof Error) errorMessage = error.message;
    return rejectWithValue(errorMessage);
  }
});

export const updateStudent = createAsyncThunk<Student, Student>(
  "student/update",
  async (updatedStudent, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/student/update-student/${updatedStudent.id}`,
        updatedStudent
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Student updated successfully");
      }
      return response.data.data as Student;
    } catch (error: unknown) {
      let errorMessage = "Failed to update student";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteStudent = createAsyncThunk<string, string>(
  "student/delete",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/student/delete-student/${studentId}`
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Student deleted successfully");
      }
      return studentId;
    } catch (error: unknown) {
      let errorMessage = "Failed to delete student";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// ------------------ Slice ------------------
const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add student
      .addCase(addStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.students = [...state.students, action.payload];
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add student";
      })

      // Fetch students
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.students;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch students";
      })

      // Update student
      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.students = state.students.map((student) =>
          student.id === action.payload.id ? action.payload : student
        );
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update student";
      })

      // Delete student
      .addCase(deleteStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.students = state.students.filter(
          (student) => student.id !== action.payload
        );
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete student";
      });
  },
});

export default studentSlice.reducer;
