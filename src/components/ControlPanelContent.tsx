// src/app/components/ControlPanelContent.tsx
'use client';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const ControlPanelContent = ({ isOpen }: { isOpen: boolean }) => {
    const { data: session } = useSession();

    // Only show ctrl panel for logged in user
    if (!session) return null;

    return (
        <div
            className={`fixed left-0 top-0 h-full w-64 bg-base-200 bg-opacity-80 p-4 flex flex-col transform ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-transform duration-300 ease-in-out`}
        >
            <div className="flex-grow">
                {/* Add other control panel content here */}
            </div>
            <button
                onClick={() => signOut()}
                className="btn btn-primary w-full"
            >
                Log out
            </button>
        </div>
    );
};

export default ControlPanelContent;
