// src/app/space/[spaceId]/page.tsx
'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import Preloader from '@/components/Preloader/Preloader';
import dynamic from 'next/dynamic';
import { setCurrentSpace } from '@/store/spaceSlice';
import { useDispatch } from 'react-redux';

// Dynamic import allows for lazy loading of the Space component
const Space = dynamic(() => import('@/components/Space/Space'), {
    loading: () => <Preloader />,
});

const SpacePage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { spaceId } = useParams();
    const { isLoaded, isSignedIn } = useUser();
    const initialDataLoaded = useSelector(
        (state: RootState) => state.loading.initialDataLoaded
    );
    const spaces = useSelector((state: RootState) => state.spaces.spaces);

    if (!isSignedIn && isLoaded) {
        redirect('/sign-in');
    }

    if (!isLoaded || !initialDataLoaded) {
        return <Preloader />;
    }

    if (!spaceId) {
        return <div>Space ID is required</div>;
    }

    const spaceToLoad = spaces.find((space) => space._id === spaceId);
    const spaceExists = spaceToLoad !== undefined;

    if (!spaceExists) {
        redirect('/');
    }

    dispatch(setCurrentSpace(spaceToLoad));

    return (
        <div className="w-full h-screen">
            <Space spaceId={spaceId as string} />
        </div>
    );
};

export default SpacePage;
