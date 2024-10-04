import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
    name: 'loading',
    initialState: {
        initialDataLoaded: false,
    },
    reducers: {
        setInitialDataLoaded: (state, action) => {
            state.initialDataLoaded = action.payload;
        },
    },
});

export const { setInitialDataLoaded } = loadingSlice.actions;
export default loadingSlice.reducer;
