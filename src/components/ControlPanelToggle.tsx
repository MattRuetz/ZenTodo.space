// src/app/components/ControlPanelToggle.tsx
'use client';
import { useSession } from 'next-auth/react';

interface ControlPanelToggleProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const ControlPanelToggle: React.FC<ControlPanelToggleProps> = ({
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
