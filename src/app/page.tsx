'use client';
import { useSession } from 'next-auth/react';
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

export default function Home() {
    const { data: session, status } = useSession();
    const [fadeOut, setFadeOut] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const initialDataLoaded = useSelector(
        (state: RootState) => state.loading.initialDataLoaded
    );

    useEffect(() => {
        const fetchData = async () => {
            if (status === 'authenticated' && !initialDataLoaded) {
                await dispatch(fetchSpaces());
                await dispatch(fetchTasks());
                await dispatch(fetchTheme());
                dispatch(setInitialDataLoaded(true));
            }
        };

        if (typeof window !== 'undefined') {
            fetchData();
        }
    }, [status, dispatch, initialDataLoaded]);

    if (status === 'loading' || !initialDataLoaded) {
        return <Preloader />;
    }

    if (!session) {
        redirect('/lander');
    }

    return (
        <main className="w-full h-screen">
            <SuperSpace />
        </main>
    );
}
