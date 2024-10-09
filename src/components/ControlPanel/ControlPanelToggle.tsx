// src/app/components/ControlPanelToggle.tsx
'use client';
import React, { useMemo, useCallback } from 'react';
import { SpaceFilters } from '../Space/SpaceFilters';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
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

        // Memoize button text based on isOpen and isMobile
        const buttonText = useMemo(
            () => (isOpen && !isMobile ? '×' : '☰'),
            [isOpen, isMobile]
        );

        // Memoize button styles
        const buttonStyles = useMemo(
            () => ({
                boxShadow: 'none',
                backgroundColor: isMobile
                    ? 'transparent'
                    : `var(--${currentTheme}-background-200)`,
                borderColor: isMobile ? 'transparent' : 'black',
                color: color,
            }),
            [isMobile, currentTheme, color]
        );

        // Callback to toggle the panel
        const handleToggle = useCallback(() => {
            setIsOpen(!isOpen);
        }, [setIsOpen, isOpen]);

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
                    style={buttonStyles}
                    onClick={handleToggle}
                >
                    {buttonText}
                </button>
                <div
                    className="text-lg flex items-center justify-center"
                    style={{
                        display: isMobile ? 'none' : 'block',
                    }}
                >
                    <SpaceFilters spaceId={spaceId ?? ''} />
                </div>
            </div>
        );
    }
);

export default ControlPanelToggle;
