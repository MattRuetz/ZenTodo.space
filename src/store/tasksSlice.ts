// src/store/tasksSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid'; // You might need to install this package
import { Task } from '../types';
import { RootState } from './store';

interface TasksState {
    tasks: Task[];
    localTasks: Task[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: TasksState = {
    tasks: [],
    localTasks: [],
    status: 'idle',
    error: null,
};

export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async (spaceId: string) => {
        const response = await fetch(`/api/tasks?spaceId=${spaceId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        return response.json();
    }
);

export const addTask = createAsyncThunk(
    'tasks/addTask',
    async (task: Task, { rejectWithValue }) => {
        try {
            const { _id, isVirgin, ...taskData } = task; // Remove _id and isVirgin before sending to server
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            });
            if (!response.ok) throw new Error('Failed to add task');
            const data = await response.json();
            return data.task as Task;
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async (
        partialTask: Partial<Task> & { _id: string },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;
            const existingTask = state.tasks.tasks.find(
                (t: Task) => t._id === partialTask._id
            );

            if (!existingTask) {
                throw new Error('Task not found');
            }

            const updatedTask = { ...existingTask, ...partialTask };

            const response = await fetch('/api/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            const data = await response.json();
            return data.task;
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async (taskId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/tasks?id=${taskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            const data = await response.json();
            return taskId;
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        addLocalTask: (state, action: PayloadAction<Task>) => {
            const localId = uuidv4(); // Generate a temporary local ID
            state.localTasks.push({ ...action.payload, _id: localId });
        },
        updateLocalTask: (state, action: PayloadAction<Task>) => {
            const index = state.localTasks.findIndex(
                (task) => task._id === action.payload._id
            );
            if (index !== -1) {
                state.localTasks[index] = action.payload;
            }
        },
        removeLocalTask: (state, action: PayloadAction<string>) => {
            state.localTasks = state.localTasks.filter(
                (task) => task._id !== action.payload
            );
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tasks = action.payload.tasks;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || null;
            })
            .addCase(addTask.fulfilled, (state, action) => {
                state.tasks.push(action.payload);
                // Remove the corresponding local task if it exists
                state.localTasks = state.localTasks.filter(
                    (task) => task._id !== action.meta.arg._id
                );
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state.tasks.findIndex(
                    (task) => task._id === action.payload._id
                );
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.tasks = state.tasks.filter(
                    (task) => task._id !== action.payload
                );
            });
    },
});
export const { addLocalTask, updateLocalTask, removeLocalTask } =
    tasksSlice.actions;

export default tasksSlice.reducer;
