import { SortOption } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    isGlobalDragging: boolean;
    draggingCardId: string | null;
    isSubtaskDrawerOpen: boolean;
    subtaskDrawerParentId: string | null;
    sortOption: SortOption;
    isReversed: boolean;
    isSimplicityModalOpen: boolean;
}

const initialState: UIState = {
    isGlobalDragging: false,
    draggingCardId: null,
    isSubtaskDrawerOpen: false,
    subtaskDrawerParentId: null,
    sortOption: 'custom',
    isReversed: false,
    isSimplicityModalOpen: false,
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
        setSortOption: (state, action: PayloadAction<SortOption>) => {
            state.sortOption = action.payload;
        },
        setIsReversed: (state, action: PayloadAction<boolean>) => {
            state.isReversed = action.payload;
        },
        setSimplicityModalOpen: (state, action: PayloadAction<boolean>) => {
            state.isSimplicityModalOpen = action.payload;
        },
    },
});

export const {
    setGlobalDragging,
    setDraggingCardId,
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
    setSortOption,
    setIsReversed,
    setSimplicityModalOpen,
} = uiSlice.actions;
export default uiSlice.reducer;
