// src/components/DraggableArea.tsx
import React from 'react';
import DragHandle from './DragHandle';

interface DraggableAreaProps {
    children: React.ReactNode;
    className: String;
    onDelete: () => void;
}

const DraggableArea: React.FC<DraggableAreaProps> = ({
    children,
    className,
    onDelete,
}) => {
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
            <DragHandle className="pb-2" onDelete={onDelete} />
            {children}
        </div>
    );
};

export default DraggableArea;
