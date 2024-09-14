// src/components/TaskCardToolBar.tsx
import React from 'react';
import { FaClock } from 'react-icons/fa';
import { Task, TaskProgress } from '@/types';
import SubtaskProgresses from './SubtaskProgresses';
import { ProgressDropdown } from './ProgressDropdown';
import { Icon } from './Icon';
import { Tooltip } from 'react-tooltip';

export interface TaskCardToolBarProps {
    task: Task;
    progress: TaskProgress;
    onProgressChange: (progress: TaskProgress) => void;
    handleResizeStart: (e: React.MouseEvent) => void;
    isResizing: boolean;
}

const TaskCardToolBar: React.FC<TaskCardToolBarProps> = React.memo(
    ({ task, progress, onProgressChange, handleResizeStart, isResizing }) => {
        return (
            <div className="task-card-toolbar flex flex-row justify-between w-full gap-2 py-2">
                <div className="flex flex-row gap-2 items-center max-w-7/12">
                    <ProgressDropdown
                        progress={progress}
                        onProgressChange={onProgressChange}
                        isSubtask={false}
                    />
                    {task.dueDate && (
                        <div className="text-xs">
                            <div
                                data-tooltip-id={`due-date-tooltip-${task._id}`}
                                className="cursor-pointer"
                            >
                                <FaClock className="text-gray-400 text-lg" />
                            </div>
                            <Tooltip
                                id={`due-date-tooltip-${task._id}`}
                                place="top"
                            >
                                Due Date:{' '}
                                {new Date(task.dueDate).toLocaleDateString()}
                            </Tooltip>
                        </div>
                    )}
                </div>
                <SubtaskProgresses
                    data-tooltip-id={`${task._id}-subtask-progresses-tooltip`}
                    task={task}
                />

                <div
                    className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize"
                    onMouseDown={handleResizeStart}
                >
                    <Icon
                        name="resize"
                        color="rgba(255, 255, 255, 0.3)"
                        size={21}
                    />
                </div>
            </div>
        );
    }
);

export default TaskCardToolBar;
