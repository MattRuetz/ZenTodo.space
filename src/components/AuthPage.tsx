'use client';

import React, { useMemo } from 'react';
import { getQuoteForDay } from '@/hooks/useQuoteForDay';
import Image from 'next/image';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { SignIn, SignUp } from '@clerk/nextjs';

interface AuthPageProps {
    action: 'sign-up' | 'sign-in';
}

const AuthPage: React.FC<AuthPageProps> = ({ action }) => {
    const isMobileSize = useIsMobileSize();
    const quote = useMemo(() => getQuoteForDay(), []);

    const renderAuthComponent = () => {
        if (action === 'sign-up') {
            return (
                <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
            );
        } else {
            return (
                <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
            );
        }
    };

    return (
        <>
            {isMobileSize ? (
                <div className="min-h-screen flex flex-col bg-black">
                    <div className="p-6 flex flex-col items-center justify-center w-11/12 mx-auto">
                        <Image
                            src="/images/ZenTodo_Log_white.png"
                            alt="ZenTodo Logo"
                            width={300}
                            height={83}
                            className="mb-4"
                            priority={true}
                        />
                        <p className="text-sm text-neutral-content italic text-center mb-6">
                            {quote}
                        </p>
                    </div>
                    <div className="flex justify-center bg-gradient-to-b from-slate-900 to-slate-700 p-6 rounded-t-3xl shadow-md mx-2">
                        {renderAuthComponent()}
                    </div>
                </div>
            ) : (
                <div className="h-screen flex items-center justify-start bg-gradient-to-br from-slate-100 to-slate-200">
                    <div className="bg-gradient-to-b from-slate-900 to-slate-700 p-3 shadow-md w-4/12 min-w-[450px] h-full">
                        <div className="flex flex-col items-center justify-center h-full">
                            {renderAuthComponent()}
                        </div>
                    </div>
                    <div className="p-3 w-8/12 h-full flex flex-col items-center justify-center">
                        <Image
                            src="/images/ZenTodo_Log_slate900.png"
                            alt="ZenTodo Logo"
                            width={600}
                            height={200}
                            className="mb-10"
                            priority={true}
                        />
                        <p className="mt-2 text-md text-neutral-content italic max-w-md text-center">
                            {quote}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default AuthPage;
