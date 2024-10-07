import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';
import { RootState } from './store';
import { useSelector } from 'react-redux';

interface UserState {
    user: User | null;
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
            console.log('Fetching user data...');
            const response = await fetch(`/api/user/`);
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const data = await response.json();
            console.log('Fetched user data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updateUserData = createAsyncThunk(
    'user/updateUserData',
    async ({ userData }: { userData?: Partial<User> }, { rejectWithValue }) => {
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

export const adjustUserStats = createAsyncThunk(
    'user/adjustUserStats',
    async (
        statsDelta: Record<string, number>,
        { getState, rejectWithValue }
    ) => {
        const state = getState() as RootState; // Ensure you have the correct type
        const user = state.user.user;

        if (!user) {
            return rejectWithValue('User not found');
        }

        console.log('statsDelta', statsDelta);

        const updatedUser = {
            ...user,
            ...Object.keys(statsDelta).reduce((acc, key) => {
                if (user[key as keyof User] !== undefined) {
                    acc[key as keyof User] =
                        (user[key as keyof User] as number) + statsDelta[key];
                }
                return acc;
            }, {} as Record<string, number>),
        };

        console.log('updatedUser', updatedUser);

        try {
            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                throw new Error('Failed to adjust user stats');
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
                console.log('fetchUser.pending');
                state.status = 'loading';
            })
            .addCase(
                fetchUser.fulfilled,
                (state, action: PayloadAction<any>) => {
                    console.log('fetchUser.fulfilled', action.payload);
                    state.status = 'succeeded';
                    state.user = action.payload;
                }
            )
            .addCase(fetchUser.rejected, (state, action) => {
                console.log('fetchUser.rejected', action.error);
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
            })
            .addCase(adjustUserStats.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(
                adjustUserStats.fulfilled,
                (state, action: PayloadAction<any>) => {
                    state.status = 'succeeded';
                    state.user = action.payload;
                }
            );
    },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
