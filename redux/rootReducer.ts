import { combineReducers } from "@reduxjs/toolkit";
import courseReducer from "@/features/course/courseSlice";
const rootReducer = combineReducers({
  // Add your feature reducers here
  courses: courseReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
