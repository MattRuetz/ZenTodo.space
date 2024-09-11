// src/components/icons/TaskCardTopBar.tsx
import React from 'react';
import { FaTrash } from 'react-icons/fa6';

interface TaskCardTopBarProps {
    className?: string;
    onDelete: () => void;
}

const TaskCardTopBar: React.FC<TaskCardTopBarProps> = ({
    className = '',
    onDelete,
}) => {
    return (
        <div
            className={`flex flex-row gap-6 drag-handle cursor-move ${className}`}
        >
            <div className="justify-center w-full">
                <div
                    className="mb-1 w-full bg-sky-950"
                    style={{ height: '1px' }}
                ></div>
                <div
                    className="mb-1 w-full bg-sky-950"
                    style={{ height: '1px' }}
                ></div>
                <div
                    className="mb-1 w-full bg-sky-950"
                    style={{ height: '1px' }}
                ></div>
            </div>
            <FaTrash
                size={14}
                className="cursor-pointer text-red-500 hover:text-red-700 transition-colors duration-200 hover:scale-110 hover:rotate-12"
                onClick={onDelete}
            />
        </div>
    );
};

export default TaskCardTopBar;
