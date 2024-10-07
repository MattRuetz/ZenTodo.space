import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@clerk/nextjs/server';

interface UserState {
    user: any | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: UserState = {
    user: null,
    status: 'idle',
    error: null,
};

export const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/user/`);
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updateUserData = createAsyncThunk(
    'user/updateUserData',
    async (userData: Partial<User>, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error('Failed to update user data');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<any>) => {
            state.user = action.payload;
            state.status = 'succeeded';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(
                fetchUser.fulfilled,
                (state, action: PayloadAction<any>) => {
                    console.log('action.payload', action.payload);
                    state.status = 'succeeded';
                    state.user = action.payload;
                }
            )
            .addCase(fetchUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error =
                    action.error.message || 'Failed to fetch user data';
            })
            .addCase(updateUserData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(
                updateUserData.fulfilled,
                (state, action: PayloadAction<any>) => {
                    state.status = 'succeeded';
                    state.user = action.payload;
                }
            )
            .addCase(updateUserData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
