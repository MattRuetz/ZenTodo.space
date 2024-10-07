'use client';
// src/components/Preloader.tsx
import { getQuoteForDay } from '@/hooks/useQuoteForDay';
import React from 'react';
import styles from './Preloader.module.css'; // We'll create this file next

const Preloader: React.FC = React.memo(() => {
    const quote = getQuoteForDay();

    return (
        <div className={`fixed inset-0 ${styles.background}`}>
            <div className="h-full w-full flex flex-col items-center justify-center">
                <span className="loading loading-ring text-slate-600 loading-lg"></span>
                <p className="mt-4 text-slate-600">Loading space...</p>
                <p className="mt-2 text-md text-neutral-content italic max-w-md text-center">
                    {quote}
                </p>
            </div>
        </div>
    );
});

export default Preloader;
