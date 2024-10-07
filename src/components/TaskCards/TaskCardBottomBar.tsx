// src/components/TaskCardToolBar.tsx
import React from 'react';
import { Task, TaskProgress } from '@/types';
import SubtaskProgresses from './SubtaskProgresses';
import { ProgressDropdown } from './ProgressDropdown';
import { Icon } from '../Icon';
import { motion } from 'framer-motion';

export interface TaskCardBottomBarProps {
    task: Task;
    progress: TaskProgress;
    onProgressChange: (progress: TaskProgress) => void;
    onArchive: () => void;
    handleResizeStart: (e: React.MouseEvent) => void;
    currentTheme: string;
}

const TaskCardBottomBar: React.FC<TaskCardBottomBarProps> = React.memo(
    ({
        task,
        progress,
        onProgressChange,
        onArchive,
        handleResizeStart,
        currentTheme,
    }) => {
        return (
            <div
                className="task-card-bottom-bar flex flex-row justify-between w-full gap-2 py-2 z-10"
                style={{
                    backgroundColor: `transparent`,
                    color: `var(--${currentTheme}-text-default)`,
                }}
            >
                <div className="flex flex-row gap-2 items-center max-w-7/12">
                    <ProgressDropdown
                        progress={progress}
                        onProgressChange={onProgressChange}
                        isSubtask={false}
                        taskId={task._id ?? ''}
                        onArchive={onArchive}
                        currentProgress={task.progress}
                    />
                </div>
                <SubtaskProgresses
                    data-tooltip-id={`${task._id}-subtask-progresses-tooltip`}
                    task={task}
                />
                <div
                    className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-10"
                    onMouseDown={handleResizeStart}
                >
                    <Icon
                        name="resize"
                        color={`var(--${currentTheme}-background-200)`}
                        size={21}
                    />
                </div>
            </div>
        );
    }
);

export default TaskCardBottomBar;
