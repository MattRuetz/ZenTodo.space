// src/components/TaskCards/ProgressDropdown.tsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { adjustUserStats } from '@/store/userSlice';
import { FaCheck, FaChevronDown } from 'react-icons/fa';
import { FaBoxArchive } from 'react-icons/fa6';
import { Tooltip } from 'react-tooltip';

import useClickOutside from '@/hooks/useClickOutside';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { useTheme } from '@/hooks/useTheme';

import { TaskProgress } from '@/types';
import { ArchiveTaskBtn } from './ArchiveTaskBtn';
import { createSelector } from '@reduxjs/toolkit';

interface ProgressDropdownProps {
    progress: TaskProgress;
    onProgressChange: (progress: TaskProgress) => void;
    taskId: string;
    onArchive: () => void;
    currentProgress: TaskProgress;
}

const selectTaskFromState = createSelector(
    (state: RootState) => state.tasks.tasks,
    (state: RootState, taskId: string) => taskId,
    (tasks, taskId) => tasks.find((task) => task._id === taskId)
);

export const ProgressDropdown: React.FC<ProgressDropdownProps> = React.memo(
    ({ progress, onProgressChange, onArchive, taskId, currentProgress }) => {
        const dispatch = useDispatch<AppDispatch>();
        const currentTheme = useTheme();
        const isMobileSize = useIsMobileSize();

        const dropdownRef = useRef<HTMLDivElement>(null);
        const progressCardRef = useRef<HTMLDivElement>(null);
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);

        const taskFromState = useSelector((state: RootState) =>
            selectTaskFromState(state, taskId)
        );
        const progressFromState = taskFromState?.progress;

        // useEffect(() => {
        //     if (taskProgress) {
        //         setProgress(taskProgress);
        //     } else {
        //         console.error('Failed to fetch task progress from state');
        //     }
        // }, [taskId, onProgressChange]);

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

        const handleProgressClick = useCallback((e: React.MouseEvent) => {
            e.preventDefault();
            setIsDropdownOpen((prev) => !prev);
        }, []);

        const handleProgressSelect = useCallback(
            (newProgress: TaskProgress) => {
                if (newProgress === 'Complete') {
                    dispatch(adjustUserStats({ tasksCompleted: 1 }));
                } else if (currentProgress === 'Complete') {
                    dispatch(adjustUserStats({ tasksCompleted: -1 }));
                }
                onProgressChange(newProgress);
                setIsDropdownOpen(false);
            },
            [dispatch, currentProgress, onProgressChange]
        );

        const getProgressColor = () => PROGRESS_COLORS[progress];

        // Custom hook for click outside logic
        useClickOutside([dropdownRef, progressCardRef], () =>
            setIsDropdownOpen(false)
        );

        const handleArchiveClick = useCallback(() => {
            onArchive();
        }, [onArchive]);

        return (
            <div>
                <div className="flex flex-row w-full justify-start gap-2 items-center">
                    <div className="flex justify-between gap-2 items-center w-full">
                        <div
                            ref={progressCardRef}
                            className="progress-card no-drag cursor-pointer p-2 flex items-center justify-center gap-2 rounded-md"
                            style={{
                                backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                            }}
                            onClick={handleProgressClick}
                        >
                            <div
                                className={`w-3 h-3 rounded-full ${getProgressColor()} flex items-center justify-center`}
                                style={{
                                    outline: `1px solid var(--${currentTheme}-text-subtle)`, // Use theme color
                                }}
                            >
                                {progress === 'Complete' && (
                                    <FaCheck className="text-white" />
                                )}
                            </div>
                            {!isMobileSize && (
                                <Tooltip
                                    id={`${taskId}-progress-tooltip`}
                                    place="top"
                                >
                                    <div className="progressLabel">
                                        <span>{progress}</span>
                                    </div>
                                </Tooltip>
                            )}
                            <FaChevronDown
                                className={`transition-transform ${
                                    isDropdownOpen ? 'rotate-180' : ''
                                }`}
                                style={{
                                    color: `var(--${currentTheme}-text-subtle)`, // Use theme color
                                }}
                            />
                        </div>
                    </div>
                    {progressFromState === 'Complete' ? (
                        <ArchiveTaskBtn
                            taskId={taskId}
                            handleArchiveClick={handleArchiveClick}
                        />
                    ) : (
                        progress === 'Complete' && (
                            <div className="relative pointer-events-none brightness-50">
                                <ArchiveTaskBtn
                                    taskId={taskId}
                                    handleArchiveClick={handleArchiveClick}
                                />
                            </div>
                        )
                    )}
                </div>
                <div
                    ref={dropdownRef}
                    className={`progress-dropdown mt-1 absolute`}
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
                        border: `1px solid var(--${currentTheme}-accent-grey)`, // Use theme color
                        visibility: isDropdownOpen ? 'visible' : 'hidden',
                        borderRadius: '0.375rem', // Tailwind's rounded-md
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease-in-out',
                        maxHeight: isDropdownOpen ? '10rem' : '0', // Adjust max height based on dropdown state
                        zIndex: 100,
                    }}
                >
                    {PROGRESS_OPTIONS.map((progressOption) => (
                        <div
                            key={progressOption}
                            className={`p-2 cursor-pointer hover:bg-black/20`}
                            style={{
                                backgroundColor:
                                    progress === progressOption
                                        ? `var(--${currentTheme}-background-300)` // Use theme color
                                        : '', // Default background
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                            }}
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

export default ProgressDropdown;
