// src/components/DraggableArea.tsx
import React from 'react';

interface DraggableAreaProps {
    children: React.ReactNode;
    className?: string; // Use optional chaining for className
}

const DraggableArea: React.FC<DraggableAreaProps> = React.memo(
    ({ children, className = '' }) => {
        // Default to an empty string if className is not provided
        const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
            // Prevent dragging when interacting with input fields or buttons
            const target = e.target as HTMLElement; // Type assertion for better type safety
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'BUTTON'
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
