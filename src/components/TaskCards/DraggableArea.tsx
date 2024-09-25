// src/components/DraggableArea.tsx
import React from 'react';
import { Task } from '@/types';

interface DraggableAreaProps {
    children: React.ReactNode;
    className: String;
}

const DraggableArea: React.FC<DraggableAreaProps> = React.memo(
    ({ children, className }) => {
        const handleMouseDown = (e: React.MouseEvent) => {
            // Prevent dragging when interacting with input fields or buttons
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLButtonElement
            ) {
                e.stopPropagation();
            }
        };

        return (
            <div
                className={`draggable-area w-full h-full ${className}`}
                onMouseDown={handleMouseDown}
            >
                {children}
            </div>
        );
    }
);

export default DraggableArea;
