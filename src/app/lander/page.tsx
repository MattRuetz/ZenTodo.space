// src/app/lander/page.tsx
'use client';
import React, { useEffect } from 'react';
import { redirect } from 'next/navigation';
import AuthPage from '@/components/AuthPage';
import { useSession } from 'next-auth/react';

const LandingPage: React.FC = () => {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            redirect('/'); // Redirect to home if the user is authenticated
        }
    }, [status]);

    return <AuthPage />;
};

export default LandingPage;
