// src/app/components/ControlPanel.tsx
'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ControlPanelToggle from './ControlPanelToggle';
import ControlPanelContent from './ControlPanelContent';

const ControlPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <div>
            <ControlPanelContent isOpen={isOpen} />
            <ControlPanelToggle isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    );
};

export default ControlPanel;
