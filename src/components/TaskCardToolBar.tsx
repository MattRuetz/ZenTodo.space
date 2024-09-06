// src/components/TaskCardToolBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { FaTrash, FaCheck, FaChevronDown } from 'react-icons/fa';
import { TaskProgress } from '@/types';

export interface TaskCardToolBarProps {
    onDelete: () => void;
    progress: TaskProgress;
    onProgressChange: (progress: TaskProgress) => void;
}

const TaskCardToolBar: React.FC<TaskCardToolBarProps> = ({
    onDelete,
    progress,
    onProgressChange,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [shouldOpenDropdown, setShouldOpenDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const progressCardRef = useRef<HTMLDivElement>(null);

    const getProgressColor = () => {
        switch (progress) {
            case 'In Progress':
                return 'bg-yellow-400';
            case 'Blocked':
                return 'bg-red-500';
            case 'Complete':
                return 'bg-green-500';
            default:
                return 'bg-gray-300';
        }
    };

    const handleProgressClick = () => {
        setShouldOpenDropdown(!isDropdownOpen);
    };

    const handleProgressSelect = (newProgress: TaskProgress) => {
        onProgressChange(newProgress);
        setShouldOpenDropdown(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                progressCardRef.current &&
                !progressCardRef.current.contains(event.target as Node)
            ) {
                setShouldOpenDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setIsDropdownOpen(shouldOpenDropdown);
    }, [shouldOpenDropdown]);

    return (
        <div className="task-card-toolbar flex flex-col w-full">
            <div className="flex justify-between gap-2 items-center pt-2">
                <div
                    ref={progressCardRef}
                    className="progress-card no-drag cursor-pointer p-2 bg-base-100 rounded-md flex text-xs text-slate-500 items-center gap-2"
                    onClick={handleProgressClick}
                >
                    <div
                        className={`w-3 h-3 rounded-full ${getProgressColor()} flex items-center justify-center`}
                    >
                        {progress === 'Complete' && (
                            <FaCheck className="text-white" />
                        )}
                    </div>
                    <div className="progressLabel">
                        <span>{progress}</span>
                    </div>
                    <FaChevronDown
                        className={`transition-transform ${
                            isDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                </div>
                <button
                    onClick={onDelete}
                    className="delete-button no-drag text-red-500 hover:text-red-700 transition-colors duration-200"
                    aria-label="Delete task"
                >
                    <FaTrash size={14} />
                </button>
            </div>
            {isDropdownOpen && (
                <div
                    ref={dropdownRef}
                    className="progress-dropdown mt-2 bg-base-100 rounded-md shadow-md"
                >
                    {['Not Started', 'In Progress', 'Blocked', 'Complete'].map(
                        (progressOption) => (
                            <div
                                key={progressOption}
                                className={`p-2 cursor-pointer hover:bg-base-200 ${
                                    progress === progressOption
                                        ? 'bg-base-300'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleProgressSelect(
                                        progressOption as
                                            | 'Not Started'
                                            | 'In Progress'
                                            | 'Blocked'
                                            | 'Complete'
                                    )
                                }
                            >
                                {progressOption}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskCardToolBar;
