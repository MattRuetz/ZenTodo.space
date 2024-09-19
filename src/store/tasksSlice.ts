// src/store/tasksSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../types';
import { RootState } from './store';

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

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
    const response = await fetch(`/api/tasks`);
    if (!response.ok) {
        throw new Error('Failed to fetch tasks');
    }
    const tasks = await response.json();
    return tasks;
});

export const addTaskAsync = createAsyncThunk(
    'tasks/addTask',
    async (
        { task, tempId }: { task: Omit<Task, '_id'>; tempId: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...task, tempId }),
            });
            if (!response.ok) throw new Error('Failed to add task');
            const data = await response.json();
            return { newTask: data.task, originalTempId: data.originalTempId };
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const addNewSubtaskAsync = createAsyncThunk(
    'tasks/addNewSubtask',
    async (
        {
            subtask,
            parentTask,
            position,
            tempId,
        }: {
            subtask: Omit<Task, '_id'>;
            parentTask: Task | null;
            position: string;
            tempId: string;
        },
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
                    zIndex: 0,
                    parentTask: parentTask?._id || null,
                    subtasks: [],
                    ancestors: parentTask?.ancestors
                        ? [...parentTask.ancestors, parentTask._id as string]
                        : [parentTask?._id as string],
                    position: position,
                    originalTempId: tempId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add new subtask');
            }

            const data = await response.json();
            return {
                newSubtask: data.newSubtask,
                updatedParentTask: data.updatedParentTask,
                originalTempId: data.originalTempId,
            };
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
        console.log('partialTask in updateTask', partialTask);
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

export const convertTaskToSubtaskAsync = createAsyncThunk(
    'tasks/convertTaskToSubtaskAsync',
    async (
        {
            childTask,
            parentTaskId,
            oldParentTaskId,
        }: {
            childTask: Task;
            parentTaskId: string;
            oldParentTaskId: string | null;
        },
        { rejectWithValue }
    ) => {
        const MAX_RETRIES = 5;
        const INITIAL_BACKOFF = 100; // ms

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await fetch('/api/tasks/hierarchy', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subtaskIdString: childTask._id,
                        parentTaskIdString: parentTaskId,
                        oldParentTaskIdString: oldParentTaskId,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to convert task to subtask');
                }

                const data = await response.json();
                return data;
            } catch (error) {
                if (attempt === MAX_RETRIES - 1) {
                    return rejectWithValue(
                        'Max retries reached. Operation failed.'
                    );
                }

                if (
                    error instanceof Error &&
                    error.message.includes('Write conflict')
                ) {
                    console.log(
                        `Retry attempt ${
                            attempt + 1
                        } for convertTaskToSubtaskAsync`
                    );
                    await new Promise((resolve) =>
                        setTimeout(
                            resolve,
                            INITIAL_BACKOFF * Math.pow(2, attempt)
                        )
                    );
                } else {
                    throw error;
                }
            }
        }
    }
);

export const convertSubtaskToTaskAsync = createAsyncThunk(
    'tasks/convertSubtaskToTaskAsync',
    async (
        {
            subtask,
            dropPosition,
        }: {
            subtask: Task;
            dropPosition: { x: number; y: number } | undefined;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch('/api/tasks/hierarchy', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subtaskIdString: subtask._id,
                    parentTaskIdString: null,
                    oldParentTaskIdString: subtask.parentTask,
                    x: dropPosition?.x,
                    y: dropPosition?.y,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to convert subtask to task');
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

// Update the `deleteTaskAsync` thunk
export const deleteTaskAsync = createAsyncThunk(
    'tasks/deleteTaskAsync',
    async (
        { taskId, parentTaskId }: { taskId: string; parentTaskId: string | '' },
        { rejectWithValue }
    ) => {
        try {
            let response;
            if (parentTaskId === '') {
                console.log('deleting task', taskId);
                response = await fetch(`/api/tasks?id=${taskId}`, {
                    method: 'DELETE',
                });
            } else {
                console.log('deleting subtask', taskId);
                response = await fetch(
                    `/api/tasks?id=${taskId}&parentId=${parentTaskId}`,
                    {
                        method: 'DELETE',
                    }
                );
            }
            if (!response.ok) {
                throw new Error('Failed to delete task');
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

export const deleteTasksInSpace = createAsyncThunk(
    'tasks/deleteTasksInSpace',
    async (spaceId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `/api/tasks/space?spaceId=${spaceId}`,
                {
                    method: 'DELETE',
                }
            );
            if (!response.ok) {
                throw new Error('Failed to delete tasks in space');
            }
            const data = await response.json();
            console.log(
                `Deleted ${data.deletedCount} tasks in space ${spaceId}`
            );
            return spaceId;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const moveSubtaskWithinLevelAsync = createAsyncThunk(
    'tasks/moveSubtaskWithinLevel',
    async (
        {
            subtaskId,
            parentId,
            newPosition,
            newOrder,
        }: {
            subtaskId: string;
            parentId: string;
            newPosition: string;
            newOrder?: string[];
        },
        { rejectWithValue }
    ) => {
        const MAX_RETRIES = 5;
        const INITIAL_BACKOFF = 100; // ms

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await fetch('/api/tasks/move-subtask', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subtaskId,
                        parentId,
                        newPosition,
                        newOrder,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to move subtask');
                }

                const data = await response.json();
                console.log('data', data);
                return data;
            } catch (error) {
                if (error instanceof Error) {
                    return rejectWithValue(error.message);
                }
                return rejectWithValue('An unknown error occurred');
            }
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

export const duplicateTasksAsync = createAsyncThunk(
    'tasks/duplicateTasksAsync',
    async (tasksToDuplicate: Task[], { rejectWithValue }) => {
        try {
            const response = await fetch('/api/tasks/duplicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks: tasksToDuplicate }),
            });
            if (!response.ok) {
                throw new Error('Failed to duplicate tasks');
            }
            const data = await response.json();
            return data.tasks.map((task: any) => ({
                ...task,
                originalTempId: task.originalTempId || task._id,
            }));
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
        // Optimistic duplication of tasks
        addTaskOptimistic: (state, action: PayloadAction<Task>) => {
            state.tasks.push(action.payload);
        },

        addNewSubtaskOptimistic: (
            state,
            action: PayloadAction<{
                newSubtask: Task;
                parentId?: string;
                position: string;
            }>
        ) => {
            const { newSubtask, parentId, position } = action.payload;
            state.tasks.push(newSubtask);

            if (parentId) {
                const parentTask = state.tasks.find(
                    (task) => task._id === parentId
                );
                if (parentTask && newSubtask._id) {
                    if (position === 'start') {
                        parentTask.subtasks.unshift(newSubtask._id);
                    } else if (position.startsWith('after_')) {
                        const afterId = position.split('_')[1];
                        const index = parentTask.subtasks.findIndex(
                            (id) => id === afterId
                        );
                        if (index !== -1) {
                            parentTask.subtasks.splice(
                                index + 1,
                                0,
                                newSubtask._id
                            );
                        } else {
                            parentTask.subtasks.push(newSubtask._id);
                        }
                    } else {
                        parentTask.subtasks.push(newSubtask._id);
                    }
                }
            }
        },

        duplicateTasksOptimistic: (state, action: PayloadAction<Task[]>) => {
            state.tasks.push(...action.payload);
        },
        deleteTaskOptimistic: (state, action: PayloadAction<string[]>) => {
            state.tasks = state.tasks.filter(
                (task) => !action.payload.includes(task._id as string)
            );
        },
        convertTaskToSubtaskOptimistic: (
            state,
            action: PayloadAction<{
                updatedTask: Task;
                updatedParentTask: Task;
                updatedGrandparentTask?: Task;
            }>
        ) => {
            const { updatedTask, updatedParentTask, updatedGrandparentTask } =
                action.payload;

            // Remove the task from its original parent, if any
            if (updatedTask.parentTask) {
                const oldParentTask = state.tasks.find(
                    (task) => task._id === updatedTask.parentTask
                );
                if (oldParentTask) {
                    oldParentTask.subtasks = oldParentTask.subtasks.filter(
                        (id) => id !== updatedTask._id
                    );
                }
            }

            // Update the task
            const taskIndex = state.tasks.findIndex(
                (task) => task._id === updatedTask._id
            );
            if (taskIndex !== -1) {
                state.tasks[taskIndex] = updatedTask;
            }

            // Update the new parent task
            const parentTaskIndex = state.tasks.findIndex(
                (task) => task._id === updatedParentTask._id
            );
            if (parentTaskIndex !== -1) {
                state.tasks[parentTaskIndex] = updatedParentTask;
            }

            // Update the grandparent task if provided
            if (updatedGrandparentTask) {
                const grandparentTaskIndex = state.tasks.findIndex(
                    (task) => task._id === updatedGrandparentTask._id
                );
                if (grandparentTaskIndex !== -1) {
                    state.tasks[grandparentTaskIndex] = updatedGrandparentTask;
                }
            }
        },
        convertSubtaskToTaskOptimistic: (
            state,
            action: PayloadAction<{
                updatedSubtask: Task;
                updatedParentTask: Task;
                updatedGrandparentTask?: Task;
            }>
        ) => {
            const {
                updatedSubtask,
                updatedParentTask,
                updatedGrandparentTask,
            } = action.payload;
            const subtaskIndex = state.tasks.findIndex(
                (task) => task._id === updatedSubtask._id
            );
            const parentTaskIndex = state.tasks.findIndex(
                (task) => task._id === updatedParentTask._id
            );
            const grandparentTaskIndex = state.tasks.findIndex(
                (task) => task._id === updatedGrandparentTask?._id
            );

            if (subtaskIndex !== -1 && parentTaskIndex !== -1) {
                state.tasks[subtaskIndex] = updatedSubtask;
                state.tasks[parentTaskIndex] = updatedParentTask;
            }
            if (grandparentTaskIndex !== -1 && updatedGrandparentTask) {
                state.tasks[grandparentTaskIndex] = updatedGrandparentTask;
            }
        },
        moveSubtaskWithinLevelOptimistic: (
            state,
            action: PayloadAction<{
                updatedParentTask: Task;
            }>
        ) => {
            const { updatedParentTask } = action.payload;
            const parentIndex = state.tasks.findIndex(
                (task) => task._id === updatedParentTask._id
            );
            if (parentIndex !== -1) {
                state.tasks[parentIndex] = updatedParentTask;
            }
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
            .addCase(addTaskAsync.fulfilled, (state, action) => {
                const { newTask, originalTempId } = action.payload;

                const tempTask = state.tasks.find(
                    (task) => task.isTemp && task._id === originalTempId
                );
                if (tempTask) {
                    Object.assign(tempTask, { ...newTask, isTemp: false });
                } else {
                    state.tasks.push(newTask);
                }
            })
            .addCase(addTaskAsync.rejected, (state, action) => {
                state.tasks = state.tasks.filter((task) => !task.isTemp);
                state.error = action.payload as string;
            })
            .addCase(addNewSubtaskAsync.fulfilled, (state, action) => {
                const { newSubtask, updatedParentTask, originalTempId } =
                    action.payload;
                console.log('newSubtask', newSubtask);
                console.log('originalTempId', originalTempId);
                const tempSubtask = state.tasks.find(
                    (task) => task.isTemp && task._id === originalTempId
                );
                if (tempSubtask) {
                    Object.assign(tempSubtask, {
                        ...newSubtask,
                        isTemp: false,
                    });
                } else {
                    state.tasks.push(newSubtask);
                }

                if (updatedParentTask) {
                    const parentIndex = state.tasks.findIndex(
                        (task) => task._id === updatedParentTask._id
                    );
                    if (parentIndex !== -1) {
                        state.tasks[parentIndex] = updatedParentTask;
                    }
                }
            })
            .addCase(addNewSubtaskAsync.rejected, (state, action) => {
                state.tasks = state.tasks.filter((task) => !task.isTemp);
                state.error = action.payload as string;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state.tasks.findIndex(
                    (task) => task._id === action.payload._id
                );
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
            })
            .addCase(deleteTaskAsync.fulfilled, (state, action) => {
                // The optimistic update has already removed the tasks,
                // so we don't need to do anything here
            })
            .addCase(deleteTaskAsync.rejected, (state, action) => {
                // Rollback optimistic updates
                state.error = action.payload as string;
                // We need to fetch the tasks again from the server to ensure consistency
                // This could be done by dispatching a fetchTasks action
            })
            .addCase(convertTaskToSubtaskAsync.fulfilled, (state, action) => {
                const {
                    updatedOldParentTask,
                    updatedNewParentTask,
                    updatedSubtask,
                    descendantsUpdated,
                } = action.payload;

                const oldParentIndex = state.tasks.findIndex(
                    (task) => task._id === updatedOldParentTask?._id
                );
                const newParentIndex = state.tasks.findIndex(
                    (task) => task._id === updatedNewParentTask._id
                );
                const subtaskIndex = state.tasks.findIndex(
                    (task) => task._id === updatedSubtask._id
                );

                if (oldParentIndex !== -1 && updatedOldParentTask) {
                    state.tasks[oldParentIndex] = updatedOldParentTask;
                }
                if (subtaskIndex !== -1) {
                    state.tasks[subtaskIndex] = {
                        ...updatedSubtask,
                        isTemp: false,
                    };
                }
                if (newParentIndex !== -1) {
                    state.tasks[newParentIndex] = updatedNewParentTask;
                }
            })
            .addCase(convertTaskToSubtaskAsync.rejected, (state, action) => {
                // Rollback optimistic updates
                state.tasks = state.tasks.map((task) => ({
                    ...task,
                    isTemp: false,
                }));
                state.error =
                    action.error.message ||
                    'An error occurred during task conversion';
            })
            .addCase(convertSubtaskToTaskAsync.fulfilled, (state, action) => {
                const {
                    updatedOldParentTask,
                    updatedNewParentTask,
                    updatedSubtask,
                    descendantsUpdated,
                } = action.payload;

                // Update old parent task if it exists
                if (updatedOldParentTask) {
                    const oldParentIndex = state.tasks.findIndex(
                        (task) => task._id === updatedOldParentTask._id
                    );
                    if (oldParentIndex !== -1) {
                        state.tasks[oldParentIndex] = updatedOldParentTask;
                    }
                }

                // Update new parent task if it exists (should be null in this case)
                if (updatedNewParentTask) {
                    const newParentIndex = state.tasks.findIndex(
                        (task) => task._id === updatedNewParentTask._id
                    );
                    if (newParentIndex !== -1) {
                        state.tasks[newParentIndex] = updatedNewParentTask;
                    }
                }

                // Update the converted subtask
                const subtaskIndex = state.tasks.findIndex(
                    (task) => task._id === updatedSubtask._id
                );
                if (subtaskIndex !== -1) {
                    state.tasks[subtaskIndex] = {
                        ...updatedSubtask,
                        isTemp: false,
                    };
                }

                // Update ancestors of all descendants
                // This is not directly provided by the API, so we'll update based on the updatedSubtask
                state.tasks = state.tasks.map((task) => {
                    if (task.ancestors?.includes(updatedSubtask._id)) {
                        return {
                            ...task,
                            ancestors: task.ancestors.filter(
                                (id) => id !== updatedOldParentTask?._id
                            ),
                        };
                    }
                    return task;
                });
            })
            .addCase(convertSubtaskToTaskAsync.rejected, (state, action) => {
                // Rollback optimistic updates
                state.tasks = state.tasks.map((task) => ({
                    ...task,
                    isTemp: false,
                }));
                state.error = action.payload as string;
            })
            .addCase(moveSubtaskWithinLevelAsync.fulfilled, (state, action) => {
                const { updatedParent } = action.payload;

                // Update the parent task
                const parentIndex = state.tasks.findIndex(
                    (task) => task._id === updatedParent._id
                );
                if (parentIndex !== -1) {
                    state.tasks[parentIndex] = {
                        ...updatedParent,
                        isTemp: false,
                    };
                }
            })
            .addCase(moveSubtaskWithinLevelAsync.rejected, (state, action) => {
                // Rollback optimistic updates
                state.tasks = state.tasks.map((task) => ({
                    ...task,
                    isTemp: false,
                }));
                state.error = action.payload as string;
            })
            .addCase(moveTaskToSpace.fulfilled, (state, action) => {
                const index = state.tasks.findIndex(
                    (t) => t._id === action.payload._id
                );
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
            })
            .addCase(duplicateTasksAsync.fulfilled, (state, action) => {
                const duplicatedTasks = action.payload;

                // Create a mapping from old temp IDs to new real IDs
                const idMapping: { [tempId: string]: string } = {};
                for (const realTask of duplicatedTasks) {
                    if (realTask.originalTempId) {
                        idMapping[realTask.originalTempId] = realTask._id;
                    }
                }

                // Update existing tasks' references
                state.tasks = state.tasks
                    .filter((task) => !task.isTemp)
                    .map((task) => {
                        const updatedTask = { ...task };

                        // Update parentTask if it's in the mapping
                        if (task.parentTask && idMapping[task.parentTask]) {
                            updatedTask.parentTask = idMapping[task.parentTask];
                        }

                        // Update ancestors if they're in the mapping
                        updatedTask.ancestors = task.ancestors?.map(
                            (ancestorId) => idMapping[ancestorId] || ancestorId
                        );

                        // Update subtasks if they're in the mapping
                        updatedTask.subtasks = task.subtasks.map(
                            (subtaskId) =>
                                idMapping[subtaskId as unknown as string] ||
                                subtaskId
                        );

                        return updatedTask;
                    });

                // Add the new tasks to the state
                state.tasks = [
                    ...state.tasks,
                    ...duplicatedTasks.map((task: Task) => ({
                        ...task,
                        isTemp: false, // Ensure isTemp is set to false for the new tasks
                    })),
                ];
            })
            .addCase(duplicateTasksAsync.rejected, (state, action) => {
                // Rollback optimistic updates
                state.tasks = state.tasks.filter((task) => !task.isTemp);
                state.error = action.payload as string;
            })
            .addCase(deleteTasksInSpace.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteTasksInSpace.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const deletedSpaceId = action.payload;
                state.tasks = state.tasks.filter(
                    (task) => task.space !== deletedSpaceId
                );
            })
            .addCase(deleteTasksInSpace.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || null;
            });
    },
});

export const selectSubtasksByParentId = (state: RootState, parentId: string) =>
    state.tasks.tasks.filter((task) => task.parentTask === parentId);

export const {
    // hideNewChildTask,
    duplicateTasksOptimistic,
    convertTaskToSubtaskOptimistic,
    convertSubtaskToTaskOptimistic,
    moveSubtaskWithinLevelOptimistic,
    addNewSubtaskOptimistic,
    addTaskOptimistic,
    deleteTaskOptimistic,
} = tasksSlice.actions;

export default tasksSlice.reducer;
