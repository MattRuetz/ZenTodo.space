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
    isMobile: boolean;
}

const ControlPanelToggle: React.FC<ControlPanelToggleProps> = React.memo(
    ({ isOpen, setIsOpen, isMobile }) => {
        const { data: session } = useSession();
        const currentTheme = useTheme();
        if (!session) return null;

        const spaceId = useSelector(
            (state: RootState) => state.spaces.currentSpace?._id
        );

        const { clearEmojis } = useClearEmojis(spaceId ?? '');

        return (
            <div
                className="flex items-center justify-center gap-2"
                style={{
                    position: isMobile ? 'relative' : 'fixed',
                    top: isMobile ? '0' : '1rem',
                    left: isMobile ? '0' : '1rem',
                    zIndex: 10000,
                }}
            >
                <button
                    className={`z-20 btn btn-circle`}
                    style={{
                        color: `var(--${currentTheme}-text-default)`, // Use theme color
                        backgroundColor: isMobile
                            ? 'transparent'
                            : `var(--${currentTheme}-background-200)`, // Use theme color
                        borderColor: `transparent`,
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? '×' : '☰'}
                </button>
                <div
                    className="text-lg flex items-center justify-center"
                    style={{
                        display: isMobile ? 'none' : 'block',
                    }}
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
