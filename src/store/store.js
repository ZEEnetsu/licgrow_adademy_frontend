import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authReducer from './authSlice.js';
import { apiSlice } from './apiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

// Enables `refetchOnFocus` / `refetchOnReconnect` behaviours on RTK Query.
setupListeners(store.dispatch);
