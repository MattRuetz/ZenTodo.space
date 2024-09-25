'use client';
import { useSession } from 'next-auth/react';
import SuperSpace from '@/components/SuperSpace/SuperSpace';
import AuthPage from '@/components/AuthPage';
import Preloader from '@/components/SuperSpace/Preloader';
import { useEffect, useState } from 'react';
import { fetchTasks } from '@/store/tasksSlice';
import { fetchSpaces } from '@/store/spaceSlice';
import { fetchTheme } from '@/store/themeSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';

export default function Home() {
    const { data: session, status: sessionStatus } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [dataFetched, setDataFetched] = useState(false);

    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const fetchData = async () => {
            if (sessionStatus === 'authenticated' && !dataFetched) {
                await dispatch(fetchSpaces());
                await dispatch(fetchTasks());
                await dispatch(fetchTheme());
                setDataFetched(true);
            }

            if (sessionStatus !== 'loading' && !fadeOut) {
                setFadeOut(true);
                setTimeout(() => setIsLoading(false), 500); // Adjust timeout as needed
            }
        };

        if (typeof window !== 'undefined') {
            fetchData();
        }
    }, [sessionStatus, dispatch, dataFetched, fadeOut]);

    if (isLoading) {
        return <Preloader fadeOut={fadeOut} />;
    }

    if (!session) {
        return <AuthPage />;
    }

    return (
        <main className="w-full h-screen">
            <SuperSpace />
        </main>
    );
}
