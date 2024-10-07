import { ProgressDropdown } from '../TaskCards/ProgressDropdown';
import SubtaskProgresses from '../TaskCards/SubtaskProgresses';
import { Task, TaskProgress } from '@/types';

interface SubtaskBottomBarProps {
    subtask: Task;
    handleProgressChange: (TaskProgress: TaskProgress) => void;
    handleSetDueDate: (dueDate: Date | undefined) => void;
    handleArchive: () => void;
}

export const SubtaskBottomBar = ({
    subtask,
    handleProgressChange,
    handleArchive,
}: SubtaskBottomBarProps) => {
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
};
