// src/app/components/ControlPanel.tsx
'use client';
import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import ControlPanelToggle from './ControlPanelToggle';
import ControlPanelContent from './ControlPanelContent';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { isMobile, isTablet } from 'react-device-detect';
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
    const setIsOpen = (isOpen: boolean) => {
        dispatch(setControlPanelOpen(isOpen));
    };
    const { isSignedIn } = useUser();
    const isMobileSize = useIsMobileSize();
    const isMobileDevice = isMobile || isTablet;
    if (!isSignedIn) return null;

    return (
        <div style={{ zIndex: 10000 }}>
            <ControlPanelContent isOpen={isControlPanelOpen} />
            {!isMobileDevice && !isMobileSize && (
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
