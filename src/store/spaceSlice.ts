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
    async (spaceData: SpaceData) => {
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
        return response.json();
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
            });
    },
});

export const { setCurrentSpace } = spaceSlice.actions;
export default spaceSlice.reducer;
