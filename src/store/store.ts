import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './tasksSlice';

// Create and export the store
export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;