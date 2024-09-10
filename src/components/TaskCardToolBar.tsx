// src/components/TaskCardToolBar.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaTrash, FaCheck, FaChevronDown } from 'react-icons/fa';
import { Task, TaskProgress } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SubtaskProgresses from './SubtaskProgresses';
import { createSelector } from '@reduxjs/toolkit';

const selectSubtasks = createSelector(
    [
        (state: RootState) => state.tasks.tasks,
        (state: RootState, taskId: string) => taskId,
    ],
    (tasks, taskId) => {
        const task = tasks.find((t) => t._id === taskId);
        return (
            task?.subtasks
                ?.map((subtaskId) => tasks.find((t) => t._id === subtaskId))
                .filter((t): t is Task => t !== undefined) || []
        );
    }
);

export interface TaskCardToolBarProps {
    taskId: string;
    progress: TaskProgress;
    onProgressChange: (progress: TaskProgress) => void;
}

const TaskCardToolBar: React.FC<TaskCardToolBarProps> = React.memo(
    ({ taskId, progress, onProgressChange }) => {
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const [shouldOpenDropdown, setShouldOpenDropdown] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);
        const progressCardRef = useRef<HTMLDivElement>(null);

        const task = useSelector((state: RootState) =>
            state.tasks.tasks.find((t) => t._id === taskId)
        );

        const subtasks = useSelector((state: RootState) =>
            selectSubtasks(state, taskId)
        );

        const subtaskProgresses = useMemo(() => {
            return subtasks.reduce(
                (acc, subtask) => {
                    if (subtask) {
                        switch (subtask.progress) {
                            case 'Not Started':
                                acc.notStarted++;
                                break;
                            case 'In Progress':
                                acc.inProgress++;
                                break;
                            case 'Blocked':
                                acc.blocked++;
                                break;
                            case 'Complete':
                                acc.complete++;
                                break;
                        }
                    }
                    return acc;
                },
                {
                    notStarted: 0,
                    inProgress: 0,
                    blocked: 0,
                    complete: 0,
                }
            );
        }, [subtasks]);

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
                    <SubtaskProgresses
                        subtaskProgresses={subtaskProgresses}
                        parentTaskId={taskId}
                    />
                </div>
                {isDropdownOpen && (
                    <div
                        ref={dropdownRef}
                        className="progress-dropdown mt-2 bg-slate-600 rounded-md shadow-md absolute"
                    >
                        {[
                            'Not Started',
                            'In Progress',
                            'Blocked',
                            'Complete',
                        ].map((progressOption) => (
                            <div
                                key={progressOption}
                                className={`p-2 cursor-pointer hover:bg-base-200 ${
                                    progress === progressOption
                                        ? 'bg-base-300'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleProgressSelect(
                                        progressOption as TaskProgress
                                    )
                                }
                            >
                                {progressOption}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
);

export default TaskCardToolBar;
