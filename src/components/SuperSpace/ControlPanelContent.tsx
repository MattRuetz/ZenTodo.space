// src/app/components/ControlPanelContent.tsx
'use client';
import React from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

interface ControlPanelContentProps {
    isOpen: boolean;
}

const ControlPanelContent: React.FC<ControlPanelContentProps> = React.memo(
    ({ isOpen }) => {
        const { data: session } = useSession();

        return (
            <div
                className={`fixed left-0 top-0 h-full w-64 bg-base-200 bg-opacity-80 p-4 flex flex-col transform ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out`}
                style={{ zIndex: 9999 }}
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
    }
);

export default ControlPanelContent;
