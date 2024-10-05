// This hook manages setting the wallpaper for individual spaces

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateSpace } from '../store/spaceSlice';
import { AppDispatch } from '@/store/store';

const useSetWallpaper = (spaceId: string, wallpaper: string) => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(updateSpace({ _id: spaceId, wallpaper }));
    }, [dispatch, spaceId, wallpaper]);
};

export default useSetWallpaper;
