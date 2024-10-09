// src/components/Subtask/SubtaskBottomBar.tsx
import React from 'react';
import { ProgressDropdown } from '../TaskCards/ProgressDropdown';
import SubtaskProgresses from '../TaskCards/SubtaskProgresses';
import { Task, TaskProgress } from '@/types';

interface SubtaskBottomBarProps {
    subtask: Task;
    handleProgressChange: (progress: TaskProgress) => void;
    handleSetDueDate: (dueDate: Date | undefined) => void;
    handleArchive: () => void;
}

const SubtaskBottomBar: React.FC<SubtaskBottomBarProps> = React.memo(
    ({ subtask, handleProgressChange, handleArchive }) => {
        return (
            <div className="flex justify-between items-top gap-2 relative">
                <ProgressDropdown
                    progress={subtask.progress}
                    onProgressChange={handleProgressChange}
                    isSubtask={true}
                    taskId={subtask._id ?? ''}
                    onArchive={handleArchive}
                    currentProgress={subtask.progress}
                />
                <SubtaskProgresses task={subtask} />
            </div>
        );
    }
);

// Memoize the component to prevent unnecessary re-renders
export default SubtaskBottomBar;
