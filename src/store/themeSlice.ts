import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeName = 'buji' | 'daigo' | 'enzu';

interface ThemeState {
    currentTheme: ThemeName;
}

const initialState: ThemeState = {
    currentTheme: 'buji',
};

export const fetchTheme = createAsyncThunk(
    'theme/fetchTheme',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/theme');
            const data = await response.json();
            console.log('data', data);
            return data.themePreference;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const setTheme = createAsyncThunk(
    'theme/setTheme',
    async (theme: ThemeName, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/theme', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme }),
            });
            if (!response.ok) {
                throw new Error('Failed to set theme');
            }
            const data = await response.json();
            return data.theme; // Make sure this matches the key in your API response
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(setTheme.fulfilled, (state, action) => {
            state.currentTheme = action.payload;
        });
        builder.addCase(fetchTheme.fulfilled, (state, action) => {
            state.currentTheme = action.payload;
        });
    },
});

export default themeSlice.reducer;
