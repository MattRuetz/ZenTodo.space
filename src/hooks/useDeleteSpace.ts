import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { deleteSpace } from '@/store/spaceSlice';
import { AppDispatch } from '@/store/store';
import { SpaceData } from '@/types';
import { useAlert } from '@/hooks/useAlert';

export const useDeleteSpace = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { showAlert } = useAlert();

    const performDeleteSpace = useCallback(
        async (space: SpaceData) => {
            if (!space._id) {
                throw new Error('Space ID is required');
            }
            try {
                await dispatch(deleteSpace(space._id)).unwrap();
                // Optionally handle success (e.g., show a notification)
            } catch (error) {
                // Optionally handle error (e.g., show an error message)
                console.error('Failed to delete space:', error);
                showAlert('Failed to delete space', 'error');
            }
        },
        [dispatch]
    );

    return { performDeleteSpace };
};
