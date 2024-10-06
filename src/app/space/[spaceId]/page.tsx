// src/app/space/[spaceId]/page.tsx
'use client';
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Space from '@/components/Space/Space';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchSpaces } from '@/store/spaceSlice';
import { fetchTasks } from '@/store/tasksSlice';
import { fetchTheme } from '@/store/themeSlice';
import { setInitialDataLoaded } from '@/store/loadingSlice';
import Preloader from '@/components/SuperSpace/Preloader';

const SpacePage: React.FC = () => {
    const { spaceId } = useParams();
    const { isLoaded, isSignedIn, user } = useUser();
    const dispatch = useDispatch<AppDispatch>();
    const initialDataLoaded = useSelector(
        (state: RootState) => state.loading.initialDataLoaded
    );

    useEffect(() => {
        const fetchData = async () => {
            if (isSignedIn && !initialDataLoaded) {
                await dispatch(fetchSpaces());
                await dispatch(fetchTasks());
                await dispatch(fetchTheme());
                dispatch(setInitialDataLoaded(true));
            }
        };

        if (typeof window !== 'undefined') {
            fetchData();
        }
    }, [dispatch, initialDataLoaded]);

    if (!initialDataLoaded) {
        return <Preloader />;
    }

    if (!isLoaded || !isSignedIn) {
        redirect('/sign-in');
    }

    if (!spaceId) {
        return <div>Space ID is required</div>;
    }

    return (
        <div className="w-full h-screen">
            <Space spaceId={spaceId as string} />
        </div>
    );
};

export default SpacePage;
