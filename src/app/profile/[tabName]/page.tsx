// src/app/lander/page.tsx
'use client';
import React from 'react';
import ProfileArchivePage from '@/components/Profile_Archive/ProfileArchivePage';
import { useParams } from 'next/navigation';

const ProfilePage: React.FC = () => {
    const { tabName } = useParams();

    return <ProfileArchivePage activeTabStart={tabName as string} />;
};

export default ProfilePage;
