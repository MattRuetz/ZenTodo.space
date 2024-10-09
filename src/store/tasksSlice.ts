// src/store/tasksSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, SpaceData } from '../types';
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

    // Group tasks by space
    const tasksBySpace = tasks.reduce(
        (acc: { [key: string]: string[] }, task: Task) => {
            if (!task.parentTask) {
                if (!acc[task.space as string]) {
                    acc[task.space as string] = [];
                }
                acc[task.space as string].push(task._id as string);
            }
            return acc;
        },
        {}
    );

    return { tasks, tasksBySpace };
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add task');
            }

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
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add subtask');
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
                    zIndex: subtask.zIndex,
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

export const deleteTaskAsync = createAsyncThunk(
    'tasks/deleteTaskAsync',
    async (
        { taskId, parentTaskId }: { taskId: string; parentTaskId: string | '' },
        { rejectWithValue }
    ) => {
        try {
            let response;
            if (parentTaskId === '') {
                response = await fetch(`/api/tasks?id=${taskId}`, {
                    method: 'DELETE',
                });
            } else {
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
    async ({ taskId, spaceId }: { taskId: string; spaceId: string | null }) => {
        const response = await fetch(`/api/tasks/${taskId}/move`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spaceId }),
        });
        const data = await response.json();
        return data.tasks;
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
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to duplicate tasks');
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

export const archiveTaskAsync = createAsyncThunk(
    'tasks/archiveTask',
    async (
        { taskId, parentTaskId }: { taskId: string; parentTaskId?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch(`/api/tasks/archive`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taskId, parentTaskId }),
            });

            if (!response.ok) {
                throw new Error('Failed to archive task');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const moveTaskWithinLevelAsync = createAsyncThunk(
    'tasks/moveTaskWithinLevelAsync',
    async (
        {
            parentId,
            newOrder,
            spaceId,
        }: {
            parentId: string | null;
            newOrder: string[];
            spaceId: string;
        },
        { rejectWithValue }
    ) => {
        const MAX_RETRIES = 5;
        const INITIAL_BACKOFF = 100; // ms

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await fetch('/api/tasks/move-task', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        parentId,
                        newOrder,
                        spaceId,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to move task');
                }

                const data = await response.json();
                return data;
            } catch (error) {
                if (attempt === MAX_RETRIES - 1) {
                    if (error instanceof Error) {
                        return rejectWithValue(error.message);
                    }
                    return rejectWithValue('An unknown error occurred');
                }

                // Exponential backoff
                await new Promise((resolve) =>
                    setTimeout(resolve, INITIAL_BACKOFF * Math.pow(2, attempt))
                );
            }
        }
    }
);

export const clearArchivedTasks = createAsyncThunk(
    'tasks/clearArchivedTasks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/tasks/archive/clear`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to clear archived tasks');
            }
            const data = await response.json();

            return data;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updateTasksInDatabase = async (tasks: Partial<Task>[]) => {
    const response = await fetch('/api/tasks/updateMultiple', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks }),
    });

    if (!response.ok) {
        throw new Error('Failed to update tasks in the database');
    }

    return await response.json();
};

export const updateMultipleTasks = createAsyncThunk(
    'tasks/updateMultiple',
    async (updatedTasks: Partial<Task>[], { rejectWithValue }) => {
        try {
            // Update tasks in the database
            const data = await updateTasksInDatabase(updatedTasks);
            return data; // Assuming the response contains the updated tasks
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
        addTaskOptimistic: (state, action: PayloadAction<Task>) => {
            state.tasks.push(action.payload);
        },
        replaceTempTaskWithRealTask: (state, action) => {
            const { tempId, newTask } = action.payload;
            const index = state.tasks.findIndex((task) => task._id === tempId);
            if (index !== -1) {
                // Replace the temp task with the new task
                state.tasks[index] = { ...newTask, isTemp: false };
            } else {
                // If the temp task is not found, add the new task
                state.tasks.push(newTask);
            }
        },
        updateTaskInPlace: (
            state,
            action: PayloadAction<{ tempId: string; newTask: Task }>
        ) => {
            const index = state.tasks.findIndex(
                (task) => task._id === action.payload.tempId
            );
            if (index !== -1) {
                state.tasks[index] = {
                    ...state.tasks[index],
                    ...action.payload.newTask,
                    _id: action.payload.newTask._id,
                    clientId: action.payload.tempId, // Keep the clientId for stable rendering
                };
            }
        },
        updateTaskOptimistic: (
            state,
            action: PayloadAction<{
                updatedTask: Task;
            }>
        ) => {
            const { updatedTask } = action.payload;
            const index = state.tasks.findIndex(
                (task) => task._id === updatedTask._id
            );
            if (index !== -1) {
                state.tasks[index] = updatedTask;
            }
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
            const tasksToDelete = action.payload;

            state.tasks = state.tasks.map((task) => {
                if (
                    task.subtasks.some((subtaskId) =>
                        tasksToDelete.includes(subtaskId)
                    )
                ) {
                    return {
                        ...task,
                        subtasks: task.subtasks.filter(
                            (subtaskId) => !tasksToDelete.includes(subtaskId)
                        ),
                    };
                }
                return task;
            });

            state.tasks = state.tasks.filter(
                (task) => !tasksToDelete.includes(task._id as string)
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
                updatedParentTask, // This is now just a reference for the parent task
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

            if (subtaskIndex !== -1) {
                state.tasks[subtaskIndex] = updatedSubtask; // Update the subtask
            }

            if (parentTaskIndex !== -1) {
                // Only update the subtasks array of the parent task
                const parentTask = state.tasks[parentTaskIndex];
                state.tasks[parentTaskIndex] = {
                    ...parentTask, // Keep other properties intact
                    subtasks: parentTask.subtasks.filter(
                        (id) => id !== updatedSubtask._id
                    ), // Update subtasks
                };
            }

            if (grandparentTaskIndex !== -1 && updatedGrandparentTask) {
                state.tasks[grandparentTaskIndex] = updatedGrandparentTask; // Update grandparent if necessary
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
        moveTaskWithinLevelOptimistic: (
            state,
            action: PayloadAction<{
                parentId: string | null;
                newTaskOrder: string[];
                spaceId: string;
            }>
        ) => {
            const { parentId, newTaskOrder } = action.payload;

            if (parentId === null) {
                // Handle root-level tasks
                state.tasks = state.tasks.sort(
                    (a, b) =>
                        newTaskOrder.indexOf(a._id as string) -
                        newTaskOrder.indexOf(b._id as string)
                );
            } else {
                // Handle subtasks
                const parentTask = state.tasks.find(
                    (task) => task._id === parentId
                );
                if (parentTask) {
                    parentTask.subtasks = newTaskOrder;
                }
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
            .addCase(addTaskAsync.rejected, (state, action) => {
                state.tasks = state.tasks.filter((task) => !task.isTemp);
                state.error = action.payload as string;
            })
            .addCase(addNewSubtaskAsync.fulfilled, (state, action) => {
                const { newSubtask, updatedParentTask, originalTempId } =
                    action.payload;

                const subtaskIndex = state.tasks.findIndex(
                    (task) =>
                        task._id === originalTempId ||
                        task.clientId === originalTempId
                );

                if (subtaskIndex !== -1) {
                    // Update the subtask
                    state.tasks[subtaskIndex] = {
                        ...state.tasks[subtaskIndex],
                        ...newSubtask,
                        clientId: originalTempId,
                        isTemp: false,
                    };
                } else {
                    // If the subtask wasn't found, add it
                    state.tasks.push({
                        ...newSubtask,
                        clientId: originalTempId,
                        isTemp: false,
                    });
                }

                if (updatedParentTask) {
                    const parentIndex = state.tasks.findIndex(
                        (task) => task._id === updatedParentTask._id
                    );
                    if (parentIndex !== -1) {
                        // Update the entire parent task
                        state.tasks[parentIndex] = {
                            ...state.tasks[parentIndex],
                            ...updatedParentTask,
                            isTemp: false,
                        };
                    }
                }
            })

            .addCase(addNewSubtaskAsync.rejected, (state, action) => {
                state.tasks = state.tasks.filter((task) => !task.isTemp);
                state.error = action.payload as string;
            })
            // After
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state.tasks.findIndex(
                    (task) => task._id === action.payload._id
                );
                if (index !== -1) {
                    const localTask = state.tasks[index];
                    const serverTask = action.payload;

                    // Determine which fields to update
                    const mergedTask = {
                        ...localTask,
                        // Overwrite specific fields from server response
                        ...serverTask,
                        // Preserve local x and y ans zIndex if they differ from server values
                        x:
                            localTask.x !== serverTask.x
                                ? localTask.x
                                : serverTask.x,
                        y:
                            localTask.y !== serverTask.y
                                ? localTask.y
                                : serverTask.y,
                        zIndex:
                            localTask.zIndex !== serverTask.zIndex
                                ? localTask.zIndex
                                : serverTask.zIndex,
                    };

                    state.tasks[index] = mergedTask;
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

                if (subtaskIndex !== -1) {
                    // Update only the necessary fields of the subtask
                    state.tasks[subtaskIndex] = {
                        ...state.tasks[subtaskIndex],
                        ...updatedSubtask,
                        isTemp: false,
                    };
                }

                if (oldParentIndex !== -1 && updatedOldParentTask) {
                    // Update only the necessary fields of the old parent task
                    state.tasks[oldParentIndex] = {
                        ...state.tasks[oldParentIndex],
                        ...updatedOldParentTask,
                        subtasks: updatedOldParentTask.subtasks,
                        isTemp: false,
                    };
                }

                if (newParentIndex !== -1) {
                    // Update only the necessary fields of the new parent task
                    state.tasks[newParentIndex] = {
                        ...state.tasks[newParentIndex],
                        ...updatedNewParentTask,
                        isTemp: false,
                    };
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
                const updatedTasks = action.payload;
                updatedTasks.forEach((updatedTask: Task) => {
                    const index = state.tasks.findIndex(
                        (t) => t._id === updatedTask._id
                    );
                    if (index !== -1) {
                        state.tasks[index] = updatedTask;
                    }
                });
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
            })
            .addCase(archiveTaskAsync.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(archiveTaskAsync.fulfilled, (state, action) => {
                state.status = 'idle';
                const { updatedTasks, updatedParentTask } = action.payload;
                updatedTasks.forEach((updatedTask: Task) => {
                    const index = state.tasks.findIndex(
                        (t) => t._id === updatedTask._id
                    );
                    if (index !== -1) {
                        state.tasks[index] = updatedTask;
                    }
                });

                // Update the parent task if provided
                if (updatedParentTask) {
                    const parentIndex = state.tasks.findIndex(
                        (task) => task._id === updatedParentTask._id
                    );
                    if (parentIndex !== -1) {
                        state.tasks[parentIndex].subtasks =
                            updatedParentTask.subtasks;
                    }
                }
            })
            .addCase(archiveTaskAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || null;
            })
            .addCase(moveTaskWithinLevelAsync.fulfilled, (state, action) => {
                const { parentId, newOrder } = action.payload;

                if (parentId) {
                    // Update subtasks order
                    const parentTask = state.tasks.find(
                        (task) => task._id === parentId
                    );
                    if (parentTask) {
                        parentTask.subtasks = newOrder;
                    }
                } else {
                    // Update root-level tasks order
                    state.tasks = state.tasks.sort(
                        (a, b) =>
                            newOrder.indexOf(a._id as string) -
                            newOrder.indexOf(b._id as string)
                    );
                }
            })
            .addCase(clearArchivedTasks.fulfilled, (state) => {
                state.tasks = state.tasks.filter((task) => !task.isArchived);
            })
            .addCase(updateMultipleTasks.fulfilled, (state, action) => {
                action.payload.updatedTasks.forEach((updatedTask: Task) => {
                    const index = state.tasks.findIndex(
                        (task) => task._id === updatedTask._id
                    );
                    if (index !== -1) {
                        state.tasks[index] = {
                            ...state.tasks[index],
                            ...updatedTask,
                        };
                    }
                });
            });
    },
});
export const selectSubtasksByParentId = (state: RootState, parentId: string) =>
    state.tasks.tasks.filter((task) => task.parentTask === parentId);

export const {
    // hideNewChildTask,
    duplicateTasksOptimistic,
    updateTaskOptimistic,
    updateTaskInPlace,
    convertTaskToSubtaskOptimistic,
    convertSubtaskToTaskOptimistic,
    moveSubtaskWithinLevelOptimistic,
    addNewSubtaskOptimistic,
    addTaskOptimistic,
    deleteTaskOptimistic,
    moveTaskWithinLevelOptimistic,
    replaceTempTaskWithRealTask,
} = tasksSlice.actions;

export default tasksSlice.reducer;
