// src/app/components/ControlPanel.tsx
'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import ControlPanelToggle from './ControlPanelToggle';
import ControlPanelContent from './ControlPanelContent';
import { EmojiFilter } from '../Space/EmojiFilter';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { AppDispatch, RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { setControlPanelOpen } from '@/store/uiSlice';
import { useDispatch } from 'react-redux';
interface ControlPanelProps {
    toggleZoom: () => void;
    setIsProfilePageOpen: (isProfilePageOpen: boolean) => void;
    setActiveTabStart: (activeTabStart: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = React.memo(
    ({ toggleZoom, setIsProfilePageOpen, setActiveTabStart }) => {
        // const [isOpen, setIsOpen] = useState(false);
        const dispatch = useDispatch<AppDispatch>();
        const isControlPanelOpen = useSelector(
            (state: RootState) => state.ui.isControlPanelOpen
        );
        const setIsOpen = (isOpen: boolean) => {
            dispatch(setControlPanelOpen(isOpen));
        };
        const { data: session } = useSession();
        const isMobileSize = useIsMobileSize();
        if (!session) return null;

        return (
            <div style={{ zIndex: 10000 }}>
                <ControlPanelContent
                    isOpen={isControlPanelOpen}
                    toggleZoom={toggleZoom}
                    setIsProfilePageOpen={setIsProfilePageOpen}
                    setActiveTabStart={setActiveTabStart}
                />
                {!isMobileSize && (
                    <ControlPanelToggle
                        isOpen={isControlPanelOpen}
                        setIsOpen={setIsOpen}
                        isMobile={isMobileSize}
                    />
                )}
            </div>
        );
    }
);

export default ControlPanel;
