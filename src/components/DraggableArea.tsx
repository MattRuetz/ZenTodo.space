// src/components/DraggableArea.tsx
import React from 'react';
import TaskCardTopBar from './TaskCardTopBar';
import { Task } from '@/types';

interface DraggableAreaProps {
    children: React.ReactNode;
    className: String;
    onDelete: () => void;
    onDetails: () => void;
    onSetDueDate: (date: Date | null) => void;
    onAddSubtask: () => void;
    onMoveTask: (spaceId: string) => void;
    onCreateSpaceAndMoveTask: () => void;
    onDuplicateTask: () => void;
    task: Task;
}

const DraggableArea: React.FC<DraggableAreaProps> = ({
    children,
    className,
    onDelete,
    onDetails,
    onSetDueDate,
    onAddSubtask,
    onMoveTask,
    onCreateSpaceAndMoveTask,
    onDuplicateTask,
    task,
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
            <TaskCardTopBar
                className="pb-2"
                task={task}
                onDelete={onDelete}
                onDetails={onDetails}
                onSetDueDate={onSetDueDate}
                onAddSubtask={onAddSubtask}
                onMoveTask={onMoveTask}
                onCreateSpaceAndMoveTask={onCreateSpaceAndMoveTask}
                onDuplicateTask={onDuplicateTask}
            />
            {children}
        </div>
    );
};

export default DraggableArea;
