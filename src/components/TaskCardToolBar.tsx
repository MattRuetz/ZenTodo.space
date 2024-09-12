// src/components/TaskCardToolBar.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaTrash, FaCheck, FaChevronDown } from 'react-icons/fa';
import { Task, TaskProgress } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SubtaskProgresses from './SubtaskProgresses';
import { createSelector } from '@reduxjs/toolkit';
import { ProgressDropdown } from './ProgressDropdown';
import { useResizeHandle } from '@/hooks/useResizeHandle';
import { useTaskState } from '@/hooks/useTaskState';
import { Icon } from './Icon';

const selectSubtasks = createSelector(
    [
        (state: RootState) => state.tasks.tasks,
        (state: RootState, task: Task) => task,
    ],
    (tasks, task) => {
        const subtasks =
            task?.subtasks
                ?.map((subtask) =>
                    tasks.find(
                        (t) => t._id === (subtask._id as unknown as string)
                    )
                )
                .filter((t): t is Task => t !== undefined) || [];

        return subtasks;
    }
);

export interface TaskCardToolBarProps {
    task: Task;
    progress: TaskProgress;
    onProgressChange: (progress: TaskProgress) => void;
    handleResizeStart: (e: React.MouseEvent) => void;
    isResizing: boolean;
}

const TaskCardToolBar: React.FC<TaskCardToolBarProps> = React.memo(
    ({ task, progress, onProgressChange, handleResizeStart, isResizing }) => {
        const subtasks = useSelector((state: RootState) =>
            selectSubtasks(state, task)
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
                    parentTaskId={task._id ?? ''}
                />
                <div
                    className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize"
                    onMouseDown={handleResizeStart}
                >
                    {/* <FaSignal size={12} className="text-neutral-500" /> */}
                    <Icon
                        name="resize"
                        size={21}
                        className="text-slate-700 hover:text-slate-500"
                    />
                </div>
            </div>
        );
    }
);

export default TaskCardToolBar;
