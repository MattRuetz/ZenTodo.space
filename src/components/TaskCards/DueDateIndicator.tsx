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
            <div
                className={`text-sm ${
                    dueDateIsToday
                        ? 'text-red-600'
                        : dueDateIsThisWeek
                        ? 'text-yellow-300'
                        : 'text-slate-300'
                }`}
            >
                <div
                    data-tooltip-id={`due-date-tooltip-${task._id}`}
                    className="cursor-pointer"
                    onClick={handleDueDateClick}
                >
                    <FaClock className="hover:filter-saturate-150 transition-colors duration-200 text-lg" />
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
