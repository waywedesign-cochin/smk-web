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
  loading: boolean; // for fetching students / table
  submitting: boolean; // for add/update/delete actions
  error: string | null;
  currentStudent: Student | null;
}

interface FetchStudentsParams {
  search?: string;
  isFundedAccount?: true | false;
  location?: string;
  batch?: string;
  mode?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface SwitchBatchPayload {
  studentId: string;
  fromBatchId: string;
  toBatchId: string;
  changeDate: string;
  reason: string;
}

// ------------------ Initial State ------------------
const initialState: StudentState = {
  students: [],
  pagination: null,
  loading: false,
  submitting: false,
  error: null,
  currentStudent: null,
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
      return response.data.data.student as Student;
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
    const response = await axios.get(
      `${BASE_URL}/api/student/get-students?page=${params?.page}&limit=${params?.limit}`,
      {
        params: params || {},
      }
    );
    return response.data.data as StudentsResponse;
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch students";
    if (error instanceof Error) errorMessage = error.message;
    return rejectWithValue(errorMessage);
  }
});

// Fetch a single student by ID
export const fetchStudentById = createAsyncThunk<
  Student, // your Student type
  string, // the ID we pass
  { rejectValue: string }
>("students/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/student/get-students?id=${id}`
    );
    return response.data.data as Student;
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch student details";
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

export const switchStudentBatch = createAsyncThunk<
  SwitchBatchPayload,
  SwitchBatchPayload,
  { rejectValue: string }
>("student/switchBatch", async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/batch-history/switch-batch`,
      payload
    );

    if (response.data.success) {
      toast.success(response.data.message || "Batch switched successfully");
      return payload;
    } else {
      return rejectWithValue(response.data.message || "Failed to switch batch");
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
    return rejectWithValue("Failed to switch batch");
  }
});

// ------------------ Slice ------------------
const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ---------------- Fetch Students ----------------
    builder
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
      });

    // ---------------- Add Student ----------------
    builder
      .addCase(addStudent.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.submitting = false;
        state.students = [action.payload, ...state.students];
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || "Failed to add student";
      });

    // ---------------- Update Student ----------------
    builder
      .addCase(updateStudent.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.submitting = false;
        state.students = state.students.map((student) =>
          student.id === action.payload.id ? action.payload : student
        );
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || "Failed to update student";
      });

    // ---------------- Delete Student ----------------
    builder
      .addCase(deleteStudent.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.submitting = false;
        state.students = state.students.filter(
          (student) => student.id !== action.payload
        );
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || "Failed to delete student";
      });

    // ---------------- Fetch Single Student ----------------
    builder
      .addCase(fetchStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudent = action.payload;
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ---------------- Switch Student Batch ----------------
    builder
      .addCase(switchStudentBatch.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(switchStudentBatch.fulfilled, (state, action) => {
        state.submitting = false;
        const { studentId, toBatchId } = action.payload;
        state.students = state.students.map((student) =>
          student.id === studentId
            ? { ...student, currentBatch: { id: toBatchId } as any }
            : student
        );
      })
      .addCase(switchStudentBatch.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export default studentSlice.reducer;
