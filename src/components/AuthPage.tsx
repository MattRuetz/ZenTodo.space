'use client';

import React, { useState } from 'react';
import { getQuoteForDay } from '@/hooks/useQuoteForDay';
import Image from 'next/image';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { SignIn, SignUp } from '@clerk/nextjs';

const AuthPage = ({ action }: { action: 'sign-up' | 'sign-in' }) => {
    const isMobileSize = useIsMobileSize();

    const quote = getQuoteForDay();

    return (
        <>
            {isMobileSize ? (
                <div className="min-h-screen flex flex-col bg-black">
                    <div className="p-6 flex flex-col items-center justify-center w-11/12 mx-auto">
                        <Image
                            src="/images/ZenTodo_Log_white.webp"
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
                    <div className="flex-grow bg-gradient-to-b from-slate-900 to-slate-700 p-6 rounded-t-3xl shadow-md">
                        {action === 'sign-up' ? (
                            <SignUp
                                path="/sign-up"
                                routing="path"
                                signInUrl="/sign-in"
                            />
                        ) : (
                            <SignIn
                                path="/sign-in"
                                routing="path"
                                signUpUrl="/sign-up"
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-screen flex items-center justify-start bg-gradient-to-br from-slate-100 to-slate-200">
                    <div className="bg-gradient-to-b from-slate-900 to-slate-700 p-3 shadow-md w-4/12 h-full">
                        <div className="flex flex-col items-center justify-center h-full">
                            {action === 'sign-up' ? (
                                <SignUp
                                    path="/sign-up"
                                    routing="path"
                                    signInUrl="/sign-in"
                                />
                            ) : (
                                <SignIn
                                    path="/sign-in"
                                    routing="path"
                                    signUpUrl="/sign-up"
                                />
                            )}
                        </div>
                    </div>
                    <div className="p-3 w-8/12 h-full flex flex-col items-center justify-center">
                        <Image
                            src="/images/ZenTodo_Log_slate900.webp"
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
            AuthPage
        </>
    );
};

export default AuthPage;
