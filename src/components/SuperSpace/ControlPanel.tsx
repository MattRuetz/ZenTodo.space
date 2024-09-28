// src/app/components/ControlPanel.tsx
'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import ControlPanelToggle from './ControlPanelToggle';
import ControlPanelContent from './ControlPanelContent';
import { EmojiFilter } from '../Space/EmojiFilter';

interface ControlPanelProps {
    toggleZoom: () => void;
    setIsProfilePageOpen: (isProfilePageOpen: boolean) => void;
    setActiveTabStart: (activeTabStart: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = React.memo(
    ({ toggleZoom, setIsProfilePageOpen, setActiveTabStart }) => {
        const [isOpen, setIsOpen] = useState(false);
        const { data: session } = useSession();

        if (!session) return null;

        return (
            <div style={{ zIndex: 1000 }}>
                <ControlPanelContent
                    isOpen={isOpen}
                    toggleZoom={toggleZoom}
                    setIsProfilePageOpen={setIsProfilePageOpen}
                    setActiveTabStart={setActiveTabStart}
                />
                <ControlPanelToggle isOpen={isOpen} setIsOpen={setIsOpen} />
            </div>
        );
    }
);

export default ControlPanel;
