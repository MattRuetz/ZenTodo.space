import { ProgressDropdown } from '../TaskCards/ProgressDropdown';
import SubtaskProgresses from '../TaskCards/SubtaskProgresses';
import { TaskProgress } from '@/types';

interface SubtaskBottomBarProps {
    subtask: any;
    handleProgressChange: (TaskProgress: TaskProgress) => void;
    handleSetDueDate: (dueDate: Date | undefined) => void;
}

export const SubtaskBottomBar = ({
    subtask,
    handleProgressChange,
}: SubtaskBottomBarProps) => {
    return (
        <div className="flex justify-between items-top gap-2">
            <ProgressDropdown
                progress={subtask.progress}
                onProgressChange={handleProgressChange}
                isSubtask={true}
                taskId={subtask._id ?? ''}
            />
            <SubtaskProgresses task={subtask} />
        </div>
    );
};
