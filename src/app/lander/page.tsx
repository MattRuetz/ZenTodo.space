// src/app/lander/page.tsx
'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import SignInPage from '../sign-in/[[...index]]/page';

const LandingPage: React.FC = () => {
    const { userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (userId) {
            router.push('/');
        }
    }, [userId]);

    return <SignInPage />;
};

export default LandingPage;
