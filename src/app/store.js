import { configureStore } from '@reduxjs/toolkit';
import { testSlice } from './apis/tests.api.js';
import themeReducer from './features/theme.slice.js';

export const store = configureStore({
  reducer: {
    // Only register the slice reducer using its dynamic path
    theme : themeReducer,
    [testSlice.reducerPath]: testSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(testSlice.middleware),
});