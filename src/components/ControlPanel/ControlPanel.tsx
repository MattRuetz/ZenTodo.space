// src/app/components/ControlPanel.tsx
'use client';
import React, { useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import ControlPanelToggle from './ControlPanelToggle';
import ControlPanelContent from './ControlPanelContent';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { AppDispatch, RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { setControlPanelOpen } from '@/store/uiSlice';
import { useDispatch } from 'react-redux';
import { useTheme } from '@/hooks/useTheme';

const ControlPanel: React.FC = React.memo(() => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTheme = useTheme();
    const isControlPanelOpen = useSelector(
        (state: RootState) => state.ui.isControlPanelOpen
    );
    const { isSignedIn } = useUser();
    const isMobileSize = useIsMobileSize();

    // Memoized function to set control panel open state
    const setIsOpen = useCallback(
        (isOpen: boolean) => {
            dispatch(setControlPanelOpen(isOpen));
        },
        [dispatch]
    );

    // Early return if user is not signed in
    if (!isSignedIn) return null;

    return (
        <div style={{ zIndex: 10000 }}>
            <ControlPanelContent isOpen={isControlPanelOpen} />
            {!isMobileSize && (
                <ControlPanelToggle
                    isOpen={isControlPanelOpen}
                    setIsOpen={setIsOpen}
                    isMobile={isMobileSize}
                    color={`var(--${currentTheme}-text-default)`}
                />
            )}
        </div>
    );
});

export default ControlPanel;
