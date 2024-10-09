// src/components/TaskCardToolBar.tsx
import React from 'react';

import SubtaskProgresses from './SubtaskProgresses';
import { ProgressDropdown } from './ProgressDropdown';
import { Icon } from '../Icon';

import { Task, TaskProgress } from '@/types';

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
        const backgroundColor = 'transparent';
        const textColor = `var(--${currentTheme}-text-default)`;
        const resizeIconColor = `var(--${currentTheme}-background-200)`;

        return (
            <div
                className="task-card-bottom-bar flex flex-row justify-between w-full gap-2 py-2 z-10"
                style={{ backgroundColor, color: textColor }}
            >
                <div className="flex flex-row gap-2 items-center max-w-7/12">
                    <ProgressDropdown
                        progress={progress}
                        onProgressChange={onProgressChange}
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
                    <Icon name="resize" color={resizeIconColor} size={21} />
                </div>
            </div>
        );
    }
);

export default TaskCardBottomBar;
