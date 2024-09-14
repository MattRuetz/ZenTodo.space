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
            const state = getState() as RootState;
            const oldParentTask = state.tasks.tasks.find(
                (task) => task._id === childTask.parentTask
            );

            const response = await fetch('/api/tasks/hierarchy', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subtaskIdString: childTask._id,
                    parentTaskIdString: parentTaskId,
                    oldParentTaskIdString: oldParentTask?._id,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update task hierarchy');
            }

            const data = await response.json();
            console.log('data From Server', data);
            return {
                updatedOldParentTask: data.updatedOldParentTask,
                updatedNewParentTask: data.updatedNewParentTask,
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
        {
            subtask,
            parentId,
            position,
        }: { subtask: Omit<Task, '_id'>; parentId?: string; position: string },
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
                    parentTask: parentId || subtask.parentTask,
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
    async (taskId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;

            const task = state.tasks.tasks.find((task) => task._id === taskId);
            const parentTaskId = task?.parentTask;

            const response = await fetch(`/api/tasks?id=${taskId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentTaskId }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            return { taskId, parentTaskId };
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

export const moveSubtaskWithinLevel = createAsyncThunk(
    'tasks/moveSubtaskWithinLevel',
    async (
        {
            subtaskId,
            parentId,
            newPosition,
        }: { subtaskId: string; parentId: string; newPosition: string },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;
            const subtask = state.tasks.tasks.find(
                (task) => task._id === subtaskId
            );
            const parent = state.tasks.tasks.find(
                (task) => task._id === parentId
            );

            if (!subtask || !parent) {
                throw new Error('Subtask or parent not found');
            }

            if (subtask.parentTask !== parentId) {
                throw new Error(
                    'Subtask does not belong to the specified parent'
                );
            }

            let newIndex;
            if (newPosition === 'start') {
                newIndex = 0;
            } else if (newPosition.startsWith('after_')) {
                const afterId = newPosition.split('_')[1];
                const currentIndex = parent.subtasks.findIndex(
                    (id) => id.toString() === subtaskId
                );
                const afterIndex = parent.subtasks.findIndex(
                    (id) => id.toString() === afterId
                );

                if (currentIndex < afterIndex) {
                    // Moving down
                    newIndex = afterIndex;
                } else {
                    // Moving up
                    newIndex = afterIndex + 1;
                }
            } else {
                newIndex = parent.subtasks.length - 1;
            }

            console.log('newIndex', newIndex);
            console.log('subtaskId', subtaskId);
            console.log('parentId', parentId);

            const response = await fetch('/api/tasks/move-subtask', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subtaskId, parentId, newIndex }),
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

export const moveTaskToSpace = createAsyncThunk(
    'tasks/moveTaskToSpace',
    async ({ taskId, spaceId }: { taskId: string; spaceId: string }) => {
        const response = await fetch(`/api/tasks/${taskId}/move`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spaceId }),
        });
        const data = await response.json();
        return data.task;
    }
);

export const duplicateTask = createAsyncThunk(
    'tasks/duplicateTask',
    async (task: Task) => {
        const duplicate = async (taskToCopy: Task, parentId?: string) => {
            const duplicatedTask = {
                ...taskToCopy,
                taskName: `(Copy) ${taskToCopy.taskName}`,
                _id: undefined,
                parentTask: parentId,
                subtasks: [],
            };

            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duplicatedTask),
            });
            const data = await response.json();

            for (const subtask of taskToCopy.subtasks) {
                await duplicate(subtask as Task, data.task._id);
            }

            return data.task;
        };

        return await duplicate(task);
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
                const deletedTaskId = action.payload.taskId;
                state.tasks = state.tasks.filter(
                    (task) =>
                        task._id !== deletedTaskId &&
                        !task.ancestors?.includes(deletedTaskId)
                );
                const parentTaskId = action.payload.parentTaskId;

                const parentTask = state.tasks.find(
                    (task) => task._id === parentTaskId
                );
                if (parentTask) {
                    parentTask.subtasks = parentTask.subtasks.filter(
                        (subId) => subId.toString() !== deletedTaskId
                    );
                }
            })
            .addCase(convertTaskToSubtask.fulfilled, (state, action) => {
                const {
                    updatedOldParentTask,
                    updatedNewParentTask,
                    updatedSubtask,
                } = action.payload;

                // Update the old parent task
                if (updatedOldParentTask) {
                    const oldParentIndex = state.tasks.findIndex(
                        (task) => task._id === updatedOldParentTask._id
                    );
                    if (oldParentIndex !== -1) {
                        state.tasks[oldParentIndex] = updatedOldParentTask;
                    }
                }

                // Update the new parent task
                const newParentIndex = state.tasks.findIndex(
                    (task) => task._id === updatedNewParentTask._id
                );
                if (newParentIndex !== -1) {
                    state.tasks[newParentIndex] = updatedNewParentTask;
                }

                // Update or add the subtask
                const subtaskIndex = state.tasks.findIndex(
                    (task) => task._id === updatedSubtask._id
                );
                if (subtaskIndex !== -1) {
                    state.tasks[subtaskIndex] = updatedSubtask;
                } else {
                    // Since UI filters out new subtasks that are already in the parent, we need to add it here
                    state.tasks.push(updatedSubtask);
                }
            })
            .addCase(addNewSubtask.fulfilled, (state, action) => {
                const { newSubtask, updatedParentTask } = action.payload;

                // Add the new subtask to the tasks array
                state.tasks.push(newSubtask);
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
            .addCase(moveSubtaskWithinLevel.fulfilled, (state, action) => {
                const { updatedParent, movedSubtask } = action.payload;

                // Update the parent task
                const parentIndex = state.tasks.findIndex(
                    (task) => task._id === updatedParent._id
                );
                if (parentIndex !== -1) {
                    state.tasks[parentIndex] = updatedParent;
                }

                // Update the moved subtask
                const subtaskIndex = state.tasks.findIndex(
                    (task) => task._id === movedSubtask._id
                );
                if (subtaskIndex !== -1) {
                    state.tasks[subtaskIndex] = movedSubtask;
                }
            })
            .addCase(moveTaskToSpace.fulfilled, (state, action) => {
                const index = state.tasks.findIndex(
                    (t) => t._id === action.payload._id
                );
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
            })
            .addCase(duplicateTask.fulfilled, (state, action) => {
                state.tasks.push(action.payload);
            });
    },
});

export const selectSubtasksByParentId = (state: RootState, parentId: string) =>
    state.tasks.tasks.filter((task) => task.parentTask === parentId);

export const { hideNewChildTask } = tasksSlice.actions;

export default tasksSlice.reducer;
