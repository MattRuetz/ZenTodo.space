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

export const convertTaskToSubtask = createAsyncThunk(
    'tasks/convertTaskToSubtask',
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

export const addNewSubtask = createAsyncThunk(
    'tasks/addNewSubtask',
    async (
        { subtask, position }: { subtask: Omit<Task, '_id'>; position: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch('/api/tasks/subtask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskName: subtask.taskName,
                    taskDescription: subtask.taskDescription,
                    x: subtask.x,
                    y: subtask.y,
                    progress: subtask.progress,
                    space: subtask.space,
                    zIndex: 0, // Set the zIndex here
                    parentTask: subtask.parentTask,
                    subtasks: [],
                    ancestors: subtask.ancestors,
                    position: position,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add new subtask');
            }

            const data = await response.json();
            return {
                newSubtask: data.newSubtask,
                updatedParentTask: data.updatedParentTask,
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
                (subId) => subId.toString() !== subtask._id
            ),
        };

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
        const updatedParentTaskResult = await dispatch(
            updateTask(updatedParentTask as Partial<Task> & { _id: string })
        );
        const newTaskResult = await dispatch(
            updateTask(newTask as unknown as Partial<Task> & { _id: string })
        );

        // Dispatch action to update space max zIndex
        await dispatch(
            updateSpaceMaxZIndex({
                spaceId: parentTask.space,
                maxZIndex: newZIndex.payload as number,
            })
        );

        // Return the updated tasks from the database
        return {
            updatedParentTask: updatedParentTaskResult.payload as Task,
            newTask: newTaskResult.payload as Task,
        };
    }
);

export const moveSubtask = createAsyncThunk(
    'tasks/moveSubtask',
    async (
        {
            subtaskId,
            newParentId,
            newPosition,
        }: { subtaskId: string; newParentId: string; newPosition: string },
        { getState, dispatch }
    ) => {
        try {
            const state = getState() as RootState;
            const subtask = state.tasks.tasks.find(
                (task) => task._id === subtaskId
            );
            const newParent = state.tasks.tasks.find(
                (task) => task._id === newParentId
            );

            if (!subtask || !newParent) {
                throw new Error('Subtask or new parent not found');
            }

            let newIndex;
            if (newPosition === 'start') {
                newIndex = 0;
            } else if (newPosition.startsWith('after_')) {
                const afterId = newPosition.split('_')[1];
                const currentIndex = newParent.subtasks.findIndex(
                    (id) => id.toString() === subtaskId
                );
                const afterIndex = newParent.subtasks.findIndex(
                    (id) => id.toString() === afterId
                );

                if (currentIndex === -1) {
                    // The subtask is coming from a different parent
                    newIndex = afterIndex + 1;
                } else if (currentIndex < afterIndex) {
                    // Moving down
                    newIndex = afterIndex;
                } else {
                    // Moving up
                    newIndex = afterIndex + 1;
                }
            } else {
                newIndex = newParent.subtasks.length;
            }

            const response = await fetch('/api/tasks/move-subtask', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subtaskId, newParentId, newIndex }),
            });

            if (!response.ok) {
                throw new Error('Failed to move subtask');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const updateSubtaskOrder = createAsyncThunk(
    'tasks/updateSubtaskOrder',
    async (
        { parentId, subtaskIds }: { parentId: string; subtaskIds: string[] },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch('/api/tasks/subtask-order', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentId, subtaskIds }),
            });

            if (!response.ok) {
                throw new Error('Failed to update subtask order');
            }

            const data = await response.json();
            return data;
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
            .addCase(convertTaskToSubtask.fulfilled, (state, action) => {
                const { updatedParentTask, updatedSubtask } = action.payload;

                // Update the parent task
                const parentIndex = state.tasks.findIndex(
                    (task) => task._id === updatedParentTask._id
                );
                if (parentIndex !== -1) {
                    state.tasks[parentIndex] = updatedParentTask;
                }

                // Update the child task (now a subtask)
                const childIndex = state.tasks.findIndex(
                    (task) => task._id === updatedSubtask._id
                );
                if (childIndex !== -1) {
                    state.tasks[childIndex] = updatedSubtask;
                } else {
                    // If the subtask is not in the state, add it
                    state.tasks.push(updatedSubtask);
                }
            })
            .addCase(addNewSubtask.fulfilled, (state, action) => {
                const { newSubtask, updatedParentTask } = action.payload;

                // Add the new subtask to the tasks array
                state.tasks.push(newSubtask);

                console.log(updatedParentTask);

                // Update the parent task
                const parentIndex = state.tasks.findIndex(
                    (task) => task._id === updatedParentTask._id
                );
                if (parentIndex !== -1) {
                    state.tasks[parentIndex] = updatedParentTask;
                }
            })
            .addCase(convertSubtaskToTask.fulfilled, (state, action) => {
                if (!action.payload) {
                    // The conversion didn't happen, so we don't need to update the state
                    return;
                }

                const { updatedParentTask, newTask } = action.payload;

                // Update the parent task in the state
                const parentIndex = state.tasks.findIndex(
                    (task) => task._id === updatedParentTask._id
                );
                if (parentIndex !== -1) {
                    state.tasks[parentIndex] = updatedParentTask;
                }

                // Update the converted task in the state
                const taskIndex = state.tasks.findIndex(
                    (task) => task._id === newTask._id
                );
                if (taskIndex !== -1) {
                    state.tasks[taskIndex] = newTask;
                } else {
                    state.tasks.push(newTask);
                }
            })
            .addCase(moveSubtask.fulfilled, (state, action) => {
                const { updatedOldParent, updatedNewParent, movedSubtask } =
                    action.payload;

                // Update the old parent
                const oldParentIndex = state.tasks.findIndex(
                    (task) => task._id === updatedOldParent._id
                );
                if (oldParentIndex !== -1) {
                    state.tasks[oldParentIndex] = updatedOldParent;
                }

                // Update the new parent
                const newParentIndex = state.tasks.findIndex(
                    (task) => task._id === updatedNewParent._id
                );
                if (newParentIndex !== -1) {
                    state.tasks[newParentIndex] = updatedNewParent;
                }

                // Update the moved subtask
                const subtaskIndex = state.tasks.findIndex(
                    (task) => task._id === movedSubtask._id
                );
                if (subtaskIndex !== -1) {
                    state.tasks[subtaskIndex] = movedSubtask;
                }
            })
            .addCase(updateSubtaskOrder.fulfilled, (state, action) => {
                const { parentId, updatedSubtasks } = action.payload;
                const parentIndex = state.tasks.findIndex(
                    (task) => task._id === parentId
                );
                if (parentIndex !== -1) {
                    state.tasks[parentIndex].subtasks = updatedSubtasks;
                }
            });
    },
});

export const selectSubtasksByParentId = (state: RootState, parentId: string) =>
    state.tasks.tasks.filter((task) => task.parentTask === parentId);

export const { hideNewChildTask } = tasksSlice.actions;

export default tasksSlice.reducer;
