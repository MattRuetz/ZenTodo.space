// src/store/spaceSlice.ts
import { SpaceData } from '@/types';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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
            });
    },
});

export const { setCurrentSpace } = spaceSlice.actions;
export default spaceSlice.reducer;
