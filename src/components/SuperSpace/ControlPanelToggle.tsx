// src/app/components/ControlPanelToggle.tsx
'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { EmojiFilter } from '../Space/EmojiFilter';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { useClearEmojis } from '@/hooks/useClearEmojis';
import { useTheme } from '@/hooks/useTheme';
interface ControlPanelToggleProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const ControlPanelToggle: React.FC<ControlPanelToggleProps> = React.memo(
    ({ isOpen, setIsOpen }) => {
        const { data: session } = useSession();
        const currentTheme = useTheme();
        if (!session) return null;

        const spaceId = useSelector(
            (state: RootState) => state.spaces.currentSpace?._id
        );

        const { clearEmojis } = useClearEmojis(spaceId ?? '');

        return (
            <div>
                <button
                    className={`fixed top-4 left-4 z-20 btn btn-circle ${
                        isOpen ? 'bg-sky-950' : ''
                    }`}
                    style={{
                        color: `var(--${currentTheme}-text-default)`, // Use theme color
                        backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
                        zIndex: 10000,
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? '×' : '☰'}
                </button>
                <div
                    className="absolute top-6 left-20 text-lg flex items-center justify-center"
                    style={{ zIndex: 10000 }}
                >
                    <EmojiFilter
                        clearSelectedEmojis={clearEmojis}
                        spaceId={spaceId ?? ''}
                    />
                </div>
            </div>
        );
    }
);

export default ControlPanelToggle;
