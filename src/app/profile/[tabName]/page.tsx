// src/app/lander/page.tsx
'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Preloader from '@/components/Preloader/Preloader';
import dynamic from 'next/dynamic';

// Dynamic import allows for lazy loading of the Space component
const ProfileArchivePage = dynamic(
    () => import('@/components/Profile_Archive/ProfileArchivePage'),
    {
        loading: () => <Preloader />,
    }
);

const ProfilePage: React.FC = () => {
    const { tabName } = useParams();

    const { isLoaded, isSignedIn } = useUser();

    const initialDataLoaded = useSelector(
        (state: RootState) => state.loading.initialDataLoaded
    );

    if (!isLoaded || !initialDataLoaded) {
        return <Preloader />;
    }

    if (!isSignedIn) {
        redirect('/sign-in');
    }

    return <ProfileArchivePage activeTabStart={tabName as string} />;
};

export default ProfilePage;
