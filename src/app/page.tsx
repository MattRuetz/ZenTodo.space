'use client';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import SuperSpace from '@/components/SuperSpace/SuperSpace';
import Preloader from '@/components/SuperSpace/Preloader';
import { use, useEffect, useState } from 'react';
import { fetchTasks } from '@/store/tasksSlice';
import { fetchSpaces } from '@/store/spaceSlice';
import { fetchTheme } from '@/store/themeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { setInitialDataLoaded } from '@/store/loadingSlice';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { isSignedIn, isLoaded } = useUser();
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
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
    }, [isSignedIn, isLoaded, initialDataLoaded]);

    if (isSignedIn && !initialDataLoaded) {
        return <Preloader />;
    }

    if (!isSignedIn) {
        router.push('/sign-in');
    }

    return (
        <main className="w-full h-screen">
            <SuperSpace />
        </main>
    );
}
