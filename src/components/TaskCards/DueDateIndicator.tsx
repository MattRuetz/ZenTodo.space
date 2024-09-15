import { Task } from '@/types';
import { FaClock } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

export const DueDateIndicator = ({ task }: { task: Task }) => {
    return (
        <>
            <div className="text-sm">
                <div
                    data-tooltip-id={`due-date-tooltip-${task._id}`}
                    className="cursor-pointer"
                >
                    <FaClock className="text-slate-300 hover:text-sky-300 transition-colors duration-200 text-lg" />
                </div>
                <Tooltip id={`due-date-tooltip-${task._id}`} place="top">
                    Due Date:{' '}
                    {new Date(task.dueDate as Date).toLocaleDateString()}
                </Tooltip>
            </div>
        </>
    );
};
