import { updateSpaceSelectedEmojis } from '@/store/spaceSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';

export const useClearEmojis = (spaceId: string) => {
    const dispatch = useDispatch<AppDispatch>();

    const clearEmojis = () => {
        if (spaceId) {
            dispatch(
                updateSpaceSelectedEmojis({
                    spaceId,
                    selectedEmojis: [],
                })
            );
        }
    };

    return { clearEmojis };
};
