// src/app/components/ControlPanel.tsx
'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import ControlPanelToggle from './ControlPanelToggle';
import ControlPanelContent from './ControlPanelContent';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { isMobile, isTablet } from 'react-device-detect';
import { AppDispatch, RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { setControlPanelOpen } from '@/store/uiSlice';
import { useDispatch } from 'react-redux';

const ControlPanel: React.FC = React.memo(() => {
    const dispatch = useDispatch<AppDispatch>();
    const isControlPanelOpen = useSelector(
        (state: RootState) => state.ui.isControlPanelOpen
    );
    const setIsOpen = (isOpen: boolean) => {
        dispatch(setControlPanelOpen(isOpen));
    };
    const { data: session } = useSession();
    const isMobileSize = useIsMobileSize();
    const isMobileDevice = isMobile || isTablet;
    if (!session) return null;

    return (
        <div style={{ zIndex: 10000 }}>
            <ControlPanelContent isOpen={isControlPanelOpen} />
            {!isMobileDevice && !isMobileSize && (
                <ControlPanelToggle
                    isOpen={isControlPanelOpen}
                    setIsOpen={setIsOpen}
                    isMobile={isMobileSize}
                />
            )}
        </div>
    );
});

export default ControlPanel;
