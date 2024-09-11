// src/components/TaskCardToolBar.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaTrash, FaCheck, FaChevronDown } from 'react-icons/fa';
import { Task, TaskProgress } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SubtaskProgresses from './SubtaskProgresses';
import { createSelector } from '@reduxjs/toolkit';
import { ProgressDropdown } from './ProgressDropdown';

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

        return (
            <div className="task-card-toolbar flex flex-row justify-between w-full py-2">
                <ProgressDropdown
                    progress={progress}
                    onProgressChange={onProgressChange}
                    isSubtask={false}
                />
                <SubtaskProgresses
                    subtaskProgresses={subtaskProgresses}
                    parentTaskId={taskId}
                />
            </div>
        );
    }
);

export default TaskCardToolBar;
