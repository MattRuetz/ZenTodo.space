'use client';
import { useUser } from '@clerk/nextjs';
import Preloader from '@/components/Preloader/Preloader';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

const SuperSpace = dynamic(() => import('@/components/SuperSpace/SuperSpace'), {
    loading: () => <Preloader />,
});

export default function Home() {
    const { isLoaded, isSignedIn } = useUser();
    const initialDataLoaded = useSelector(
        (state: RootState) => state.loading.initialDataLoaded
    );

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            redirect('/sign-in');
        }
    }, [isLoaded, isSignedIn]);

    if (!isLoaded || !initialDataLoaded) {
        return <Preloader />;
    }

    return (
        <main className="w-full h-screen">
            <SuperSpace />
        </main>
    );
}
