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
    async (
        {
            spaceId,
            selectedEmojis,
        }: { spaceId: string; selectedEmojis: string[] },
        { getState, dispatch }
    ) => {
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
        console.log('updateSpaceSelectedEmojis', data);

        return data;
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
        setInitialSpace: (state) => {
            if (state.spaces.length > 0 && !state.currentSpace) {
                state.currentSpace = state.spaces[0];
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
            });
    },
});

export const { setCurrentSpace, setInitialSpace } = spaceSlice.actions;
export default spaceSlice.reducer;
