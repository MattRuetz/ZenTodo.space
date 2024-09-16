// src/app/components/ControlPanel.tsx
'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import ControlPanelToggle from './ControlPanelToggle';
import ControlPanelContent from './ControlPanelContent';
import { EmojiFilter } from '../Space/EmojiFilter';

const ControlPanel = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <div style={{ zIndex: 1000 }}>
            <ControlPanelContent isOpen={isOpen} />
            <ControlPanelToggle isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    );
});

export default ControlPanel;
