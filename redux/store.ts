import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

// export const store = configureStore({
//   reducer: rootReducer,
// });

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
