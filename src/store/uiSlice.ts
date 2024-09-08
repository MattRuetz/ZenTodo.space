import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    isGlobalDragging: boolean;
    draggingCardId: string | null;
    // ... other UI state properties
}

const initialState: UIState = {
    isGlobalDragging: false,
    draggingCardId: null,
    // ... other initial state properties
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setGlobalDragging: (state, action: PayloadAction<boolean>) => {
            state.isGlobalDragging = action.payload;
        },
        setDraggingCardId: (state, action: PayloadAction<string | null>) => {
            state.draggingCardId = action.payload;
        },
        // ... other reducers
    },
});

export const { setGlobalDragging, setDraggingCardId } = uiSlice.actions;
export default uiSlice.reducer;
