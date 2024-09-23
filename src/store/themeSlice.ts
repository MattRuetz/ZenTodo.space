import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeName = 'buji' | 'daigo' | 'enzu';

interface ThemeState {
    currentTheme: ThemeName;
}

const initialState: ThemeState = {
    currentTheme: 'buji',
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<ThemeName>) => {
            state.currentTheme = action.payload;
        },
    },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
