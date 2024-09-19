import useClickOutside from '@/hooks/useClickOutside';
import { TaskProgress } from '@/types';
import React, { useEffect, useRef, useState } from 'react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

interface ProgressDropdownProps {
    progress: TaskProgress;
    onProgressChange: (progress: TaskProgress) => void;
    isSubtask?: boolean;
    taskId: string;
}

export const ProgressDropdown: React.FC<ProgressDropdownProps> = React.memo(
    ({ progress, onProgressChange, isSubtask, taskId }) => {
        const dropdownRef = useRef<HTMLDivElement>(null);
        const progressCardRef = useRef<HTMLDivElement>(null);
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const [shouldOpenDropdown, setShouldOpenDropdown] = useState(false);

        const PROGRESS_OPTIONS: TaskProgress[] = [
            'Not Started',
            'In Progress',
            'Blocked',
            'Complete',
        ];

        // Extract color mapping to a constant
        const PROGRESS_COLORS: Record<TaskProgress, string> = {
            'Not Started': 'bg-gray-300',
            'In Progress': 'bg-yellow-400',
            Blocked: 'bg-red-500',
            Complete: 'bg-green-500',
        };

        const handleProgressClick = () => {
            setShouldOpenDropdown(!isDropdownOpen);
        };

        const handleProgressSelect = (newProgress: TaskProgress) => {
            onProgressChange(newProgress);
            setShouldOpenDropdown(false);
        };

        const getProgressColor = () => PROGRESS_COLORS[progress];

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

        // Custom hook for click outside logic
        useClickOutside([dropdownRef, progressCardRef], () =>
            setShouldOpenDropdown(false)
        );

        useEffect(() => {
            setIsDropdownOpen(shouldOpenDropdown);
        }, [shouldOpenDropdown]);

        return (
            <div data-tooltip-id={`${taskId}-progress-tooltip`}>
                <div className="flex flex-col w-full justify-start gap-2 items-center">
                    <div className="flex justify-between gap-2 items-center w-full">
                        <div
                            ref={progressCardRef}
                            className="progress-card no-drag cursor-pointer p-2 bg-base-100 hover:bg-slate-800 transition-colors duration-200 rounded-md flex text-xs text-slate-500 items-center gap-2"
                            onClick={handleProgressClick}
                        >
                            <div
                                className={`w-3 h-3 rounded-full ${getProgressColor()} flex items-center justify-center`}
                            >
                                {progress === 'Complete' && (
                                    <FaCheck className="text-white" />
                                )}
                            </div>
                            <Tooltip
                                id={`${taskId}-progress-tooltip`}
                                place="top"
                            >
                                <div className="progressLabel">
                                    <span>{progress}</span>
                                </div>
                            </Tooltip>
                            <FaChevronDown
                                className={`transition-transform ${
                                    isDropdownOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </div>
                    </div>
                </div>
                <div
                    ref={dropdownRef}
                    className={`progress-dropdown mt-1 bg-slate-600 rounded-md shadow-md overflow-hidden transition-all duration-300 ease-in-out ${
                        isSubtask ? 'w-full' : 'w-48 absolute'
                    } ${isDropdownOpen ? 'max-h-40' : 'max-h-0'}`}
                >
                    {PROGRESS_OPTIONS.map((progressOption) => (
                        <div
                            key={progressOption}
                            className={`p-2 cursor-pointer hover:bg-base-200 ${
                                progress === progressOption ? 'bg-base-300' : ''
                            }`}
                            onClick={() => handleProgressSelect(progressOption)}
                        >
                            {progressOption}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);
