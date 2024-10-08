import {
    updateSpaceSelectedDueDateRange,
    updateSpaceSelectedEmojis,
    updateSpaceSelectedProgresses,
} from '@/store/spaceSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { useAlert } from '@/hooks/useAlert';
import { createSelector } from '@reduxjs/toolkit';

// Memoized selectors
export const selectSelectedEmojis = createSelector(
    (state: RootState) => state.spaces.currentSpace,
    (currentSpace) => currentSpace?.selectedEmojis || []
);

export const selectSelectedProgresses = createSelector(
    (state: RootState) => state.spaces.currentSpace,
    (currentSpace) => currentSpace?.selectedProgresses || []
);

export const selectSelectedDueDateRange = createSelector(
    (state: RootState) => state.spaces.currentSpace,
    (currentSpace) => currentSpace?.selectedDueDateRange || null
);

export const useClearFilters = (spaceId: string) => {
    const dispatch = useDispatch<AppDispatch>();
    const { showAlert } = useAlert();

    const selectedEmojis = useSelector(selectSelectedEmojis);
    const selectedProgresses = useSelector(selectSelectedProgresses);
    const selectedDueDateRange = useSelector(selectSelectedDueDateRange);

    const clearFilters = () => {
        if (
            selectedEmojis.length === 0 &&
            selectedProgresses.length === 0 &&
            selectedDueDateRange === null
        ) {
            return;
        }
        if (spaceId) {
            dispatch(
                updateSpaceSelectedEmojis({
                    spaceId,
                    selectedEmojis: [],
                })
            );
            dispatch(
                updateSpaceSelectedProgresses({
                    spaceId,
                    selectedProgresses: [],
                })
            );
            dispatch(
                updateSpaceSelectedDueDateRange({
                    spaceId,
                    selectedDueDateRange: null,
                })
            );
            showAlert('Filters cleared.', 'notice');
        }
    };

    return { clearFilters };
};
