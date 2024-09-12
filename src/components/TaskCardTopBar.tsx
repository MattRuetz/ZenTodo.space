// src/components/icons/TaskCardTopBar.tsx
import React, { useState } from 'react';
import { FaEllipsisV, FaTrash, FaInfoCircle } from 'react-icons/fa';

interface TaskCardTopBarProps {
    className?: string;
    onDelete: () => void;
    onDetails: () => void;
}

const TaskCardTopBar: React.FC<TaskCardTopBarProps> = ({
    className = '',
    onDelete,
    onDetails,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
            <div className="relative">
                <FaEllipsisV
                    size={14}
                    className="cursor-pointer text-sky-700 hover:text-sky-500 transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-200 ring-1 ring-black ring-opacity-5">
                        <div
                            className="py-1"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="options-menu"
                        >
                            <button
                                className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-slate-300 w-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    console.log('delete');
                                    onDelete();
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <FaTrash className="mr-2" /> Delete
                            </button>
                            <button
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-slate-300 w-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    console.log('details');
                                    onDetails();
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <FaInfoCircle className="mr-2" /> Details
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskCardTopBar;
