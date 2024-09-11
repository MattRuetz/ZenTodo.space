import { Task } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    isGlobalDragging: boolean;
    draggingCardId: string | null;
    isSubtaskDrawerOpen: boolean;
    subtaskDrawerParentId: string | null;
}

const initialState: UIState = {
    isGlobalDragging: false,
    draggingCardId: null,
    isSubtaskDrawerOpen: false,
    // ... other initial state properties
    isSubtaskDrawerOpen: false,
    subtaskDrawerParentId: null,
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
        setSubtaskDrawerOpen: (state, action: PayloadAction<boolean>) => {
            state.isSubtaskDrawerOpen = action.payload;
        },
        setSubtaskDrawerParentId: (
            state,
            action: PayloadAction<string | null>
        ) => {
            state.subtaskDrawerParentId = action.payload;
        },
        // ... other reducers
    },
});

export const {
    setGlobalDragging,
    setDraggingCardId,
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
} = uiSlice.actions;
export default uiSlice.reducer;
