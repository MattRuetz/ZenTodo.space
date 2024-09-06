// src/app/components/ControlPanelToggle.tsx
'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

const ControlPanelToggle = ({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}) => {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <button
            className="fixed top-4 left-4 z-20 btn btn-circle"
            onClick={() => setIsOpen(!isOpen)}
        >
            {isOpen ? '×' : '☰'}
        </button>
    );
};

export default ControlPanelToggle;
