import { FaInfoCircle } from 'react-icons/fa';
import { FaX } from 'react-icons/fa6';
import { useDateString, useDateTimeString } from '@/hooks/useDateString';
import { Task } from '@/types';

interface TaskDetailsProps {
    task: Task;
    setShowDetails: (showDetails: boolean) => void;
}

export const TaskDetails = ({ task, setShowDetails }: TaskDetailsProps) => {
    return (
        <div className="absolute overflow-y-auto top-0 left-0 w-full h-full z-10 rounded-xl backdrop-blur-sm border border-slate-500 bg-base-200 bg-opacity-80 text-slate-200 p-4 overflow-hidden text-sm">
            <div className="flex flex-row justify-between items-center mb-4">
                <h3 className="text-sm font-bold px-4 py-2 rounded-lg bg-slate-200 text-slate-800">
                    {task.taskName.substring(0, 15) +
                        (task.taskName.length > 15 ? '...' : '')}
                </h3>
                <button
                    className="btn btn-circle btn-sm btn-ghost"
                    onClick={() => setShowDetails(false)}
                >
                    <FaX />
                </button>
            </div>
            <p>
                Due Date:{' '}
                {task.dueDate
                    ? useDateString(new Date(task.dueDate))
                    : 'Not set'}
            </p>
            <hr className="my-2" />
            <p>
                Created:{' '}
                {task.createdAt
                    ? useDateTimeString(new Date(task.createdAt))
                    : 'Unknown'}
            </p>
            <hr className="my-2" />
            <p>
                Updated:{' '}
                {task.updatedAt
                    ? useDateTimeString(new Date(task.updatedAt))
                    : 'Unknown'}
            </p>
            <hr className="my-2" />
            <p>Progress: {task.progress}</p>
        </div>
    );
};
