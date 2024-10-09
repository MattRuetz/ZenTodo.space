// src/app/lander/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Preloader from '@/components/Preloader/Preloader';
import dynamic from 'next/dynamic';
import { fetchUser } from '@/store/userSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';

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

    const initialDataLoaded = useSelector(
        (state: RootState) => state.loading.initialDataLoaded
    );

    // Need to fetch user stats when the user is loaded and the initial data is loaded
    useEffect(() => {
        if (isLoaded && initialDataLoaded) {
            console.log('Fetching user stats');
            dispatch(fetchUser())
                .then((action) => {
                    if (fetchUser.fulfilled.match(action)) {
                        console.log('User fetch succeeded:', action.payload);
                    } else if (fetchUser.rejected.match(action)) {
                        console.error('User fetch failed:', action.error);
                    }
                })
                .catch((error) => {
                    console.error('Error in fetchUser dispatch:', error);
                });
        }
    }, [isLoaded, dispatch, initialDataLoaded]);

    if (!isSignedIn) {
        redirect('/sign-in');
    }

    if (!isLoaded || !initialDataLoaded) {
        return <Preloader />;
    }

    return <ProfileArchivePage activeTabStart={tabName as string} />;
};

export default ProfilePage;
