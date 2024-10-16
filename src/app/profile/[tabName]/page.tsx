// src/app/lander/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Preloader from '@/components/Preloader/Preloader';
import dynamic from 'next/dynamic';
import { fetchUser } from '@/store/userSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { useRouter } from 'next/navigation';
// Dynamic import allows for lazy loading of the Space component
const ProfileArchivePage = dynamic(
    () => import('@/components/Profile_Archive/ProfileArchivePage'),
    {
        loading: () => <Preloader />,
    }
);

const ProfilePage: React.FC = () => {
    const { tabName } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();

    const initialDataLoaded = useSelector(
        (state: RootState) => state.loading.initialDataLoaded
    );

    // Need to fetch user stats when the user is loaded and the initial data is loaded
    useEffect(() => {
        if (isLoaded && initialDataLoaded) {
            dispatch(fetchUser())
                .then((action) => {
                    if (fetchUser.rejected.match(action)) {
                        console.error('User fetch failed:', action.error);
                    }
                })
                .catch((error) => {
                    console.error('Error in fetchUser dispatch:', error);
                });
        }
    }, [isLoaded, dispatch, initialDataLoaded]);

    if (!isSignedIn && isLoaded) {
        router.push('/sign-in');
    }
    if (!isLoaded || !initialDataLoaded) {
        return <Preloader />;
    }

    return <ProfileArchivePage activeTabStart={tabName as string} />;
};

export default ProfilePage;
