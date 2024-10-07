'use client';
import { useUser } from '@clerk/nextjs';
import Preloader from '@/components/Preloader/Preloader';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import dynamic from 'next/dynamic';

const SuperSpace = dynamic(() => import('@/components/SuperSpace/SuperSpace'), {
    loading: () => <Preloader />,
});

export default function Home() {
    const { isLoaded } = useUser();
    const initialDataLoaded = useSelector(
        (state: RootState) => state.loading.initialDataLoaded
    );

    if (!isLoaded || !initialDataLoaded) {
        return <Preloader />;
    }

    return (
        <main className="w-full h-screen">
            <SuperSpace />
        </main>
    );
}
