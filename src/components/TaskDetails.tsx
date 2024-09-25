import { FaX } from 'react-icons/fa6';
import { useDateString, useDateTimeString } from '@/hooks/useDateString';
import { Task } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface TaskDetailsProps {
    task: Task;
    setShowDetails: (showDetails: boolean) => void;
}

export const TaskDetails = ({ task, setShowDetails }: TaskDetailsProps) => {
    const currentTheme = useTheme();
    return (
        <div
            className="absolute overflow-y-auto top-0 left-0 w-full h-full rounded-lg backdrop-blur-sm p-4 z-50"
            style={{
                border: `1px solid var(--${currentTheme}-accent-grey)`, // Use theme color for border
                backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color for background
                color: `var(--${currentTheme}-text-default)`, // Use theme color for text
            }}
        >
            <div className="flex flex-row justify-between items-center mb-4">
                <h3
                    className="text-sm font-bold px-4 py-2 rounded-lg"
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-100)`, // Use theme color for header background
                        color: `var(--${currentTheme}-text-subtle)`, // Use theme color for header text
                    }}
                >
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
            <hr
                className="my-2"
                style={{
                    backgroundColor: `var(--${currentTheme}-accent-grey)`, // Use theme color for hr
                }}
            />
            <p>
                Created:{' '}
                {task.createdAt
                    ? useDateTimeString(new Date(task.createdAt))
                    : 'Unknown'}
            </p>
            <hr
                className="my-2"
                style={{
                    backgroundColor: `var(--${currentTheme}-accent-grey)`, // Use theme color for hr
                }}
            />
            <p>
                Updated:{' '}
                {task.updatedAt
                    ? useDateTimeString(new Date(task.updatedAt))
                    : 'Unknown'}
            </p>
            <hr
                className="my-2"
                style={{
                    backgroundColor: `var(--${currentTheme}-accent-grey)`, // Use theme color for hr
                }}
            />
            <p>Progress: {task.progress}</p>
        </div>
    );
};
