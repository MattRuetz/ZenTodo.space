import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './tasksSlice';
import spaceReducer from './spaceSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
    reducer: {
        tasks: tasksReducer,
        spaces: spaceReducer,
        ui: uiReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
