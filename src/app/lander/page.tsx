// src/app/lander/page.tsx
'use client';
import React, { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import SignInPage from '../sign-in/[[...index]]/page';

const LandingPage: React.FC = () => {
    const { userId } = useAuth();

    useEffect(() => {
        if (userId) {
            redirect('/'); // Redirect to home if the user is authenticated
        }
    }, [userId]);

    return <SignInPage />;
};

export default LandingPage;
