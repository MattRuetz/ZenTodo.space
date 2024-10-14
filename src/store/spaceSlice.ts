// src/store/spaceSlice.ts
import { SpaceData } from '@/types';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { deleteTasksInSpace } from './tasksSlice';

interface SpaceState {
    spaces: SpaceData[];
    currentSpace: SpaceData | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null | undefined;
}

const initialState: SpaceState = {
    spaces: [],
    currentSpace: null,
    status: 'idle',
    error: null,
};

export const fetchSpaces = createAsyncThunk('spaces/fetchSpaces', async () => {
    const response = await fetch('/api/spaces');
    if (!response.ok) {
        throw new Error('Failed to fetch spaces');
    }
    return response.json();
});

export const createSpace = createAsyncThunk(
    'spaces/createSpace',
    async (spaceData: Omit<SpaceData, '_id'>, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/spaces', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(spaceData),
            });
            if (!response.ok) {
                throw new Error('Failed to create space');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const reorderSpaces = createAsyncThunk(
    'spaces/reorderSpaces',
    async (newSpaces: SpaceData[], { rejectWithValue }) => {
        try {
            const response = await fetch('/api/spaces/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spaces: newSpaces }),
            });

            if (!response.ok) {
                throw new Error('Failed to reorder spaces');
            }

            const data = await response.json();
            return data.spaces;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updateSpace = createAsyncThunk(
    'spaces/updateSpace',
    async (spaceData: Partial<SpaceData>, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/spaces/${spaceData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(spaceData),
            });
            if (!response.ok) {
                throw new Error('Failed to update space');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updateSpaceMaxZIndex = createAsyncThunk(
    'spaces/updateSpaceMaxZIndex',
    async ({ spaceId, maxZIndex }: { spaceId: string; maxZIndex: number }) => {
        const response = await fetch(`/api/spaces/${spaceId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ maxZIndex }),
        });
        if (!response.ok) {
            throw new Error('Failed to update space maxZIndex');
        }
        return await response.json();
    }
);

export const fetchSpaceMaxZIndex = createAsyncThunk(
    'spaces/fetchSpaceMaxZIndex',
    async (spaceId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/spaces/${spaceId}/maxZIndex`);
            if (!response.ok) {
                throw new Error('Failed to fetch space maxZIndex');
            }
            const data = await response.json();
            return data.maxZIndex;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updateSpaceSelectedEmojis = createAsyncThunk(
    'spaces/updateSelectedEmojis',
    async ({
        spaceId,
        selectedEmojis,
    }: {
        spaceId: string;
        selectedEmojis: string[];
    }) => {
        const response = await fetch(`/api/spaces/${spaceId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ selectedEmojis }),
        });
        if (!response.ok) {
            throw new Error('Failed to update space selectedEmojis');
        }
        const data = await response.json();

        return data;
    }
);

export const updateSpaceSelectedProgresses = createAsyncThunk(
    'spaces/updateSelectedProgresses',
    async ({
        spaceId,
        selectedProgresses,
    }: {
        spaceId: string;
        selectedProgresses: string[];
    }) => {
        const response = await fetch(`/api/spaces/${spaceId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ selectedProgresses }),
        });
        if (!response.ok) {
            throw new Error('Failed to update space selectedProgresses');
        }
        const data = await response.json();
        return data;
    }
);

export const updateSpaceSelectedDueDateRange = createAsyncThunk(
    'spaces/updateSelectedDueDateRange',
    async ({
        spaceId,
        selectedDueDateRange,
    }: {
        spaceId: string;
        selectedDueDateRange: string | null;
    }) => {
        const response = await fetch(`/api/spaces/${spaceId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ selectedDueDateRange }),
        });
        if (!response.ok) {
            throw new Error('Failed to update space selectedDueDateRange');
        }
        const data = await response.json();
        return data;
    }
);

export const updateSpaceTaskOrderAsync = createAsyncThunk(
    'spaces/updateSpaceTaskOrder',
    async (
        { spaceId, taskOrder }: { spaceId: string; taskOrder: string[] },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch(`/api/spaces/${spaceId}/taskOrder`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taskOrder }),
            });
            if (!response.ok) {
                throw new Error('Failed to update space task order');
            }
            const updatedSpace = await response.json();
            return updatedSpace;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const deleteSpace = createAsyncThunk(
    'spaces/deleteSpace',
    async (spaceId: string, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetch(`/api/spaces/${spaceId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete space');
            }
            await dispatch(deleteTasksInSpace(spaceId)).unwrap();
            return spaceId;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const spaceSlice = createSlice({
    name: 'spaces',
    initialState,
    reducers: {
        setCurrentSpace: (state, action: PayloadAction<SpaceData>) => {
            state.currentSpace = action.payload;
        },
        setWallpaper: (state, action: PayloadAction<string>) => {
            if (state.currentSpace) {
                state.currentSpace.wallpaper = action.payload;
            }
        },
        reorderSpacesOptimistic: (
            state,
            action: PayloadAction<SpaceData[]>
        ) => {
            state.spaces = action.payload;
        },
        updateSpaceTaskOrderOptimistic: (
            state,
            action: PayloadAction<{
                spaceId: string;
                taskOrder: string[];
            }>
        ) => {
            const { spaceId, taskOrder } = action.payload;
            const space = state.spaces.find((s) => s._id === spaceId);
            if (space) {
                space.taskOrder = taskOrder;
            }
            if (state.currentSpace && state.currentSpace._id === spaceId) {
                state.currentSpace.taskOrder = taskOrder;
            }
        },
        updateTaskOrderAfterReplace: (
            state,
            action: PayloadAction<{
                spaceId: string;
                tempId: string;
                newTaskId: string;
            }>
        ) => {
            const { spaceId, tempId, newTaskId } = action.payload;
            const space = state.spaces.find((s) => s._id === spaceId);
            if (space) {
                space.taskOrder = space.taskOrder.map((id) =>
                    id === tempId ? newTaskId : id
                );
            }
            if (state.currentSpace && state.currentSpace._id === spaceId) {
                state.currentSpace.taskOrder = state.currentSpace.taskOrder.map(
                    (id) => (id === tempId ? newTaskId : id)
                );
            }
        },
        removeTaskFromTaskOrder: (
            state,
            action: PayloadAction<{ spaceId: string; taskId: string }>
        ) => {
            const { spaceId, taskId } = action.payload;
            const space = state.spaces.find((s) => s._id === spaceId);
            if (space) {
                space.taskOrder = space.taskOrder.filter((id) => id !== taskId);
            }
            if (state.currentSpace && state.currentSpace._id === spaceId) {
                state.currentSpace.taskOrder =
                    state.currentSpace.taskOrder.filter((id) => id !== taskId);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSpaces.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSpaces.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.spaces = action.payload;
                if (state.spaces.length > 0 && !state.currentSpace) {
                    state.currentSpace = state.spaces[0];
                }
            })
            .addCase(fetchSpaces.rejected, (state, action) => {
                state.status = 'failed';
                state.error =
                    action.error.message || 'An unknown error occurred';
            })
            .addCase(createSpace.fulfilled, (state, action) => {
                state.spaces.push(action.payload);
            })
            .addCase(updateSpaceMaxZIndex.fulfilled, (state, action) => {
                const space = state.spaces.find(
                    (s) => s._id === action.payload.spaceId
                );
                if (space) {
                    space.maxZIndex = action.payload.maxZIndex;
                }
                if (
                    state.currentSpace &&
                    state.currentSpace._id === action.payload.spaceId
                ) {
                    state.currentSpace.maxZIndex = action.payload.maxZIndex;
                }
            })
            .addCase(fetchSpaceMaxZIndex.fulfilled, (state, action) => {
                const space = state.spaces.find(
                    (s) => s._id === action.meta.arg
                );
                if (space) {
                    space.maxZIndex = action.payload;
                }
                if (
                    state.currentSpace &&
                    state.currentSpace._id === action.meta.arg
                ) {
                    state.currentSpace.maxZIndex = action.payload;
                }
            })
            .addCase(updateSpaceSelectedEmojis.fulfilled, (state, action) => {
                const space = state.spaces.find(
                    (space) => space._id === action.payload._id
                );
                if (space) {
                    space.selectedEmojis = action.payload.selectedEmojis;
                }
                if (
                    state.currentSpace &&
                    state.currentSpace._id === action.payload._id
                ) {
                    state.currentSpace.selectedEmojis =
                        action.payload.selectedEmojis;
                }
            })
            .addCase(
                updateSpaceSelectedProgresses.fulfilled,
                (state, action) => {
                    const space = state.spaces.find(
                        (s) => s._id === action.payload._id
                    );
                    if (space) {
                        space.selectedProgresses =
                            action.payload.selectedProgresses;
                    }
                    if (
                        state.currentSpace &&
                        state.currentSpace._id === action.payload._id
                    ) {
                        state.currentSpace.selectedProgresses =
                            action.payload.selectedProgresses;
                    }
                }
            )
            .addCase(
                updateSpaceSelectedDueDateRange.fulfilled,
                (state, action) => {
                    const space = state.spaces.find(
                        (s) => s._id === action.payload._id
                    );
                    if (space) {
                        space.selectedDueDateRange =
                            action.payload.selectedDueDateRange;
                    }
                    if (
                        state.currentSpace &&
                        state.currentSpace._id === action.payload._id
                    ) {
                        state.currentSpace.selectedDueDateRange =
                            action.payload.selectedDueDateRange;
                    }
                }
            )
            .addCase(updateSpaceSelectedEmojis.rejected, (state, action) => {
                console.error(
                    'Failed to update space selectedEmojis:',
                    action.payload
                );
            })
            .addCase(updateSpace.fulfilled, (state, action) => {
                const space = state.spaces.find(
                    (s) => s._id === action.payload._id
                );
                if (space) {
                    Object.assign(space, action.payload);
                }
                if (
                    state.currentSpace &&
                    state.currentSpace._id === action.payload._id
                ) {
                    Object.assign(state.currentSpace, action.payload);
                }
            })
            .addCase(deleteSpace.fulfilled, (state, action) => {
                const deletedSpaceId = action.payload;
                state.spaces = state.spaces.filter(
                    (space) => space._id !== deletedSpaceId
                );
                if (
                    state.currentSpace &&
                    state.currentSpace._id === deletedSpaceId
                ) {
                    state.currentSpace = null;
                }
            })
            .addCase(reorderSpaces.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(reorderSpaces.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.spaces = action.payload;
            })
            .addCase(reorderSpaces.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(updateSpaceTaskOrderAsync.fulfilled, (state, action) => {
                const updatedSpace = action.payload;
                const spaceIndex = state.spaces.findIndex(
                    (space) => space._id === updatedSpace._id
                );
                if (spaceIndex !== -1) {
                    state.spaces[spaceIndex].taskOrder = updatedSpace.taskOrder;
                }
                if (
                    state.currentSpace &&
                    state.currentSpace._id === updatedSpace._id
                ) {
                    state.currentSpace.taskOrder = updatedSpace.taskOrder;
                }
            })
            .addCase(updateSpaceTaskOrderAsync.rejected, (state, action) => {
                console.error(
                    'Failed to update space task order:',
                    action.payload
                );
                const notUpdatedSpace = action.payload as SpaceData;

                // Rollback the optimistic update
                const spaceIndex = state.spaces.findIndex(
                    (space) => space._id === notUpdatedSpace._id
                );
                if (spaceIndex !== -1) {
                    state.spaces[spaceIndex].taskOrder =
                        notUpdatedSpace.taskOrder;
                }
                if (
                    state.currentSpace &&
                    state.currentSpace._id === notUpdatedSpace._id
                ) {
                    state.currentSpace.taskOrder = notUpdatedSpace.taskOrder;
                }
            });
    },
});

export const {
    setCurrentSpace,
    reorderSpacesOptimistic,
    updateSpaceTaskOrderOptimistic,
    updateTaskOrderAfterReplace,
    removeTaskFromTaskOrder,
    setWallpaper,
} = spaceSlice.actions;
export default spaceSlice.reducer;
