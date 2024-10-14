'use client';
import { useUser } from '@clerk/nextjs';
import Preloader from '@/components/Preloader/Preloader';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
const SuperSpace = dynamic(() => import('@/components/SuperSpace/SuperSpace'), {
    loading: () => <Preloader />,
});

export default function Home() {
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const initialDataLoaded = useSelector(
        (state: RootState) => state.loading.initialDataLoaded
    );

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in');
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
