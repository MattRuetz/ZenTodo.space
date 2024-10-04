// src/components/Preloader.tsx
import { getQuoteForDay } from '@/hooks/useQuoteForDay';
import React from 'react';

const Preloader: React.FC = React.memo(() => {
    const quote = getQuoteForDay();

    return (
        <div
            className={
                'preloader fixed inset-0 z-50 flex flex-col items-center justify-center bg-base-100 transition-opacity duration-500 w-10/12 mx-auto'
            }
        >
            <span className="loading loading-ring text-slate-600 loading-lg"></span>
            <p className="mt-4 text-slate-600">Loading space...</p>
            <p className="mt-2 text-md text-neutral-content italic max-w-md text-center">
                {quote}
            </p>
        </div>
    );
});

export default Preloader;
