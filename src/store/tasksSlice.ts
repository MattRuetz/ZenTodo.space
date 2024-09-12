// src/store/tasksSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../types';
import { RootState } from './store';
import { fetchSpaceMaxZIndex } from './spaceSlice';
import { updateSpaceMaxZIndex } from './spaceSlice';

interface TasksState {
    tasks: Task[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: TasksState = {
    tasks: [],
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
    async (task: Omit<Task, '_id'>, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
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
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(partialTask), // Send only the partial update
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

export const addChildTask = createAsyncThunk(
    'tasks/addChildTask',
    async (
        { childTask, parentTaskId }: { childTask: Task; parentTaskId: string },
        { getState, rejectWithValue }
    ) => {
        try {
            const response = await fetch('/api/tasks/hierarchy', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subtaskIdString: childTask._id,
                    parentTaskIdString: parentTaskId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update task hierarchy');
            }

            const data = await response.json();
            return {
                updatedParentTask: data.updatedParentTask,
                updatedSubtask: data.updatedSubtask,
            };
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

            return taskId;
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const convertSubtaskToTask = createAsyncThunk(
    'tasks/convertSubtaskToTask',
    async (
        {
            subtask,
            dropPosition,
        }: {
            subtask: Task;
            dropPosition: { x: number; y: number } | undefined;
        },
        { getState, dispatch }
    ) => {
        // If dropPosition is undefined, it means the subtask was dropped on an invalid target
        if (!dropPosition) {
            return null;
        }

        const state = getState() as RootState;
        const parentTask = state.tasks.tasks.find(
            (task) => task._id === subtask.parentTask
        );

        if (!parentTask) {
            throw new Error('Parent task not found');
        }

        // Remove subtask from parent
        const updatedParentTask = {
            ...parentTask,
            subtasks: parentTask.subtasks.filter(
                (subtask) => subtask._id !== subtask._id
            ),
        };

        // const newTaskZIndex = await dispatch(
        //     fetchSpaceMaxZIndex(parentTask.space)
        // );

        const newZIndex = await dispatch(fetchSpaceMaxZIndex(parentTask.space));
        const newTask = {
            ...subtask,
            zIndex: newZIndex.payload as number,
            progress: subtask.progress,
            parentTask: null, // Remove the parentTask reference
            x: dropPosition.x,
            y: dropPosition.y,
            ancestors: [],
        };

        // Update tasks in the database
        await dispatch(
            updateTask(
                updatedParentTask as unknown as Partial<Task> & { _id: string }
            )
        );
        await dispatch(
            updateTask(newTask as unknown as Partial<Task> & { _id: string })
        );

        return { updatedParentTask, newTask };
    }
);

export const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        hideNewChildTask: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter(
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
                const deletedTaskId = action.payload;
                state.tasks = state.tasks.filter(
                    (task) =>
                        task._id !== deletedTaskId &&
                        !task.ancestors?.includes(deletedTaskId)
                );
            })
            .addCase(addChildTask.fulfilled, (state, action) => {
                const { updatedParentTask, updatedSubtask } = action.payload;

                // Update the parent task
                const parentIndex = state.tasks.findIndex(
                    (task) => task._id === updatedParentTask._id
                );
                if (parentIndex !== -1) {
                    state.tasks[parentIndex] = updatedParentTask;
                }

                // Update or add the child task
                const childIndex = state.tasks.findIndex(
                    (task) => task._id === updatedSubtask._id
                );
                if (childIndex !== -1) {
                    state.tasks[childIndex] = updatedSubtask;
                } else {
                    state.tasks.push(updatedSubtask);
                }
            })
            .addCase(convertSubtaskToTask.fulfilled, (state, action) => {
                if (!action.payload) {
                    // The conversion didn't happen, so we don't need to update the state
                    return;
                }

                const { updatedParentTask, newTask } = action.payload;

                // Update the parent task
                const parentIndex = state.tasks.findIndex(
                    (task) => task._id === updatedParentTask._id
                );
                if (parentIndex !== -1) {
                    state.tasks[parentIndex] = updatedParentTask;
                }

                // Remove the subtask from its original parent
                state.tasks = state.tasks.map((task) => {
                    if (
                        task.subtasks &&
                        task.subtasks.some(
                            (subtask) => subtask._id === newTask._id
                        )
                    ) {
                        return {
                            ...task,
                            subtasks: task.subtasks.filter(
                                (subtask) => subtask._id !== newTask._id
                            ),
                        };
                    }
                    return task;
                });

                // Add the new task (former subtask) to the main tasks array
                const taskIndex = state.tasks.findIndex(
                    (task) => task._id === newTask._id
                );
                if (taskIndex !== -1) {
                    state.tasks[taskIndex] = {
                        ...newTask,
                        parentTask: newTask.parentTask || undefined,
                    };
                } else {
                    state.tasks.push({
                        ...newTask,
                        parentTask: newTask.parentTask || undefined,
                    });
                }
            });
    },
});

export const selectSubtasksByParentId = (state: RootState, parentId: string) =>
    state.tasks.tasks.filter((task) => task.parentTask === parentId);

export const { hideNewChildTask } = tasksSlice.actions;

export default tasksSlice.reducer;
