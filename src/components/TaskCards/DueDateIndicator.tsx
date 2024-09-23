import { useTheme } from '@/hooks/useTheme';
import { Task } from '@/types';
import { FaClock } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

export const DueDateIndicator = ({
    task,
    handleDueDateClick,
}: {
    task: Task;
    handleDueDateClick: () => void;
}) => {
    const currentTheme = useTheme();
    const dueDateIsToday =
        new Date(task.dueDate as Date).toLocaleDateString() ===
        new Date().toLocaleDateString();

    let dueDateIsThisWeek = false;
    if (!dueDateIsToday) {
        const dueDate = new Date(task.dueDate as Date);
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        dueDateIsThisWeek = dueDate >= startOfWeek && dueDate <= endOfWeek;
    }

    return (
        <>
            <div className={`text-lg`}>
                <div
                    data-tooltip-id={`due-date-tooltip-${task._id}`}
                    className="cursor-pointer"
                    onClick={handleDueDateClick}
                >
                    <FaClock
                        className="hover:filter-saturate-150 transition-colors duration-200"
                        style={{
                            color: dueDateIsToday
                                ? `var(--${currentTheme}-accent-red)` // Use theme color for due today
                                : dueDateIsThisWeek
                                ? `var(--${currentTheme}-accent-yellow)` // Use theme color for due this week
                                : `var(--${currentTheme}-text-subtle)`, // Use theme color for default
                        }}
                    />
                </div>
                <Tooltip id={`due-date-tooltip-${task._id}`} place="top">
                    {dueDateIsToday
                        ? 'Due Today'
                        : `Due ${new Date(
                              task.dueDate as Date
                          ).toLocaleDateString()}`}
                </Tooltip>
            </div>
        </>
    );
};
