import {
    updateSpaceSelectedDueDateRange,
    updateSpaceSelectedEmojis,
    updateSpaceSelectedProgresses,
} from '@/store/spaceSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';

export const useClearFilters = (spaceId: string) => {
    const dispatch = useDispatch<AppDispatch>();

    const clearFilters = () => {
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
        }
    };

    return { clearFilters };
};
