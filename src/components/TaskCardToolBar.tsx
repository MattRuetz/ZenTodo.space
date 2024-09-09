// src/components/TaskCardToolBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { FaTrash, FaCheck, FaChevronDown } from 'react-icons/fa';
import { TaskProgress } from '@/types';

export interface TaskCardToolBarProps {
    progress: TaskProgress;
    onProgressChange: (progress: TaskProgress) => void;
    subtaskProgresses: {
        notStarted: number;
        inProgress: number;
        blocked: number;
        complete: number;
    };
}

const TaskCardToolBar: React.FC<TaskCardToolBarProps> = ({
    progress,
    onProgressChange,
    subtaskProgresses,
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
    }, [shouldOpenDropdown, subtaskProgresses]);

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
                <div className="flex items-center gap-2 bg-slate-900 rounded-full p-2">
                    {subtaskProgresses.notStarted > 0 && (
                        <div className="subtask-count bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs">
                            {subtaskProgresses.notStarted}
                        </div>
                    )}
                    {subtaskProgresses.inProgress > 0 && (
                        <div className="subtask-count bg-yellow-400 text-gray-700 rounded-full px-2 py-1 text-xs">
                            {subtaskProgresses.inProgress}
                        </div>
                    )}
                    {subtaskProgresses.blocked > 0 && (
                        <div className="subtask-count bg-red-500 text-gray-700 rounded-full px-2 py-1 text-xs">
                            {subtaskProgresses.blocked}
                        </div>
                    )}
                    {subtaskProgresses.complete > 0 && (
                        <div className="subtask-count bg-green-500 text-gray-700 rounded-full px-2 py-1 text-xs">
                            {subtaskProgresses.complete}
                        </div>
                    )}
                </div>
            </div>
            {isDropdownOpen && (
                <div
                    ref={dropdownRef}
                    className="progress-dropdown mt-2 bg-slate-600 rounded-md shadow-md absolute"
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
