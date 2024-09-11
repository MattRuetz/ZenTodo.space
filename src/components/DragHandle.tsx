// src/components/icons/DragHandle.tsx
import React from 'react';
import { FaTrash } from 'react-icons/fa6';

interface DragHandleProps {
    className?: string;
    onDelete: () => void;
}

const DragHandle: React.FC<DragHandleProps> = ({
    className = '',
    onDelete,
}) => {
    return (
        <div
            className={`flex flex-row gap-6 drag-handle cursor-move bg-base-400 rounded-t flex items-center ${className}`}
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
            <button
                onClick={onDelete}
                className="delete-button no-drag text-red-500 hover:text-red-700 transition-colors duration-200"
                aria-label="Delete task"
            >
                <FaTrash size={14} />
            </button>
        </div>
    );
};

export default DragHandle;
