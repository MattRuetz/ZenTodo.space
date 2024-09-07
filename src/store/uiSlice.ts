import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    isGlobalDragging: boolean;
    // ... other UI state properties
}

const initialState: UIState = {
    isGlobalDragging: false,
    // ... other initial state properties
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setGlobalDragging: (state, action: PayloadAction<boolean>) => {
            state.isGlobalDragging = action.payload;
        },
        // ... other reducers
    },
});

export const { setGlobalDragging } = uiSlice.actions;
export default uiSlice.reducer;
