// src/app/components/ControlPanelToggle.tsx
'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { EmojiFilter } from '../Space/EmojiFilter';

interface ControlPanelToggleProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const ControlPanelToggle: React.FC<ControlPanelToggleProps> = React.memo(
    ({ isOpen, setIsOpen }) => {
        const { data: session } = useSession();

        if (!session) return null;

        return (
            <div>
                <button
                    className="fixed top-4 left-4 z-20 btn btn-circle"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? '×' : '☰'}
                </button>
                <div className="absolute top-6 left-20 btn btn-circle btn-sm text-lg flex items-center justify-center">
                    <EmojiFilter />
                </div>
            </div>
        );
    }
);

export default ControlPanelToggle;
