import { combineReducers } from "@reduxjs/toolkit";
import courseReducer from "@/redux/features/course/courseSlice";
import locationReducer from "@/redux/features/location/locationSlice";
import batchReducer from "@/redux/features/batch/batchSlice";
import studentReducer from "@/redux/features/student/studentSlice";
import userReducer from "@/redux/features/user/userSlice";
import feeReducer from "@/redux/features/fee/feeSlice";
import paymentReducer from "@/redux/features/payment/paymentSlice";
const rootReducer = combineReducers({
  // Add your feature reducers here
  courses: courseReducer,
  locations: locationReducer,
  batches: batchReducer,
  students: studentReducer,
  users: userReducer,
  fees: feeReducer,
  payments: paymentReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
