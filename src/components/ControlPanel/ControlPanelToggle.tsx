// src/app/components/ControlPanelToggle.tsx
'use client';
import React from 'react';
// import { EmojiFilter } from '../Space/EmojiFilter';
import { SpaceFilters } from '../Space/SpaceFilters';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useClearEmojis } from '@/hooks/useClearEmojis';
import { useTheme } from '@/hooks/useTheme';
import { useUser } from '@clerk/nextjs';
interface ControlPanelToggleProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    isMobile: boolean;
    color: string;
}

const ControlPanelToggle: React.FC<ControlPanelToggleProps> = React.memo(
    ({ isOpen, setIsOpen, isMobile, color }) => {
        const { isSignedIn } = useUser();
        const currentTheme = useTheme();
        if (!isSignedIn) return null;

        const spaceId = useSelector(
            (state: RootState) => state.spaces.currentSpace?._id
        );

        const { clearEmojis } = useClearEmojis(spaceId ?? '');

        return (
            <div
                className="flex items-center justify-center gap-2 h-8 w-8 md:h-auto md:w-auto"
                style={{
                    position: isMobile ? 'relative' : 'fixed',
                    top: isMobile ? '0' : '1rem',
                    left: isMobile ? '0' : '1rem',
                    zIndex: 10000,
                }}
            >
                <button
                    className={`z-20 btn btn-circle border text-lg`}
                    style={{
                        boxShadow: 'none',
                        backgroundColor: isMobile
                            ? 'transparent'
                            : `var(--${currentTheme}-background-200)`, // Use theme color
                        borderColor: isMobile ? 'transparent' : 'black',
                        color: color,
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen && !isMobile ? '×' : '☰'}
                </button>
                <div
                    className="text-lg flex items-center justify-center"
                    style={{
                        display: isMobile ? 'none' : 'block',
                    }}
                >
                    {/* <EmojiFilter
                        clearSelectedEmojis={clearEmojis}
                        spaceId={spaceId ?? ''}
                    /> */}
                    <SpaceFilters spaceId={spaceId ?? ''} />
                </div>
            </div>
        );
    }
);

export default ControlPanelToggle;
