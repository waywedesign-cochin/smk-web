import { combineReducers } from "@reduxjs/toolkit";
import courseReducer from "@/redux/features/course/courseSlice";
import locationReducer from "@/redux/features/location/locationSlice";
import batchReducer from "@/redux/features/batch/batchSlice";
import studentReducer from "@/redux/features/student/studentSlice";
import userReducer from "@/redux/features/user/userSlice";
import feeReducer from "@/redux/features/fee/feeSlice";
import paymentReducer from "@/redux/features/payment/paymentSlice";
import cashbookReducer from "@/redux/features/cashbook/cashbookSlice";
import communicationLogReducer from "@/redux/features/communication-log/communicationLogSlice";
import reportsReducer from "@/redux/features/reports/reportsSlice";
import directorLedgerReducer from "@/redux/features/directorledger/directorSlice";
import bankReducer from "@/redux/features/bank/bankSlice";
const rootReducer = combineReducers({
  // Add your feature reducers here
  courses: courseReducer,
  locations: locationReducer,
  batches: batchReducer,
  students: studentReducer,
  users: userReducer,
  fees: feeReducer,
  payments: paymentReducer,
  cashbook: cashbookReducer,
  communicationLogs: communicationLogReducer,
  reports: reportsReducer,
  directorLedger: directorLedgerReducer,
  bank: bankReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
