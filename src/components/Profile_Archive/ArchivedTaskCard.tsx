import { Task, SpaceData } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import {
    FaTag,
    FaCalendarAlt,
    FaUndo,
    FaTrash,
    FaExclamationTriangle,
} from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { moveTaskToSpace } from '@/store/tasksSlice';
import { useDispatch } from 'react-redux';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import { ComponentSpinner } from '../ComponentSpinner';
import { useAlert } from '@/hooks/useAlert';
import { Tooltip } from 'react-tooltip';

interface ArchivedTaskCardProps {
    task: Task;
    spaces: SpaceData[];
}

const getDaysUntilDeletion = (archivedAt: string) => {
    const archiveDate = new Date(archivedAt);
    const deleteDate = new Date(
        archiveDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const now = new Date();
    return Math.ceil(
        (deleteDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
    );
};

const isApproachingDeletion = (archivedAt: string) => {
    const daysUntilDeletion = getDaysUntilDeletion(archivedAt);
    return daysUntilDeletion <= 7;
};

const ArchivedTaskCard: React.FC<ArchivedTaskCardProps> = ({
    task,
    spaces,
}) => {
    const { showAlert } = useAlert();
    const currentTheme = useTheme();
    const dispatch = useDispatch();
    const [showRecoverOptions, setShowRecoverOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const recoverOptionsRef = useRef<HTMLDivElement>(null);

    const handleRecoverTask = (taskId: string, spaceId: string) => {
        setIsLoading(true);
        // Change space of task and its descendants, and set isArchived to false for all
        try {
            dispatch(moveTaskToSpace({ taskId, spaceId }) as unknown as any);
            setShowRecoverOptions(false);
            showAlert('Task recovered successfully', 'success');
        } catch (error) {
            showAlert('Error recovering task', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const { initiateDeleteTask } = useDeleteTask();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                recoverOptionsRef.current &&
                !recoverOptionsRef.current.contains(event.target as Node)
            ) {
                setShowRecoverOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            id={task._id}
            key={task._id}
            className="p-3 sm:p-4 rounded-lg shadow-md relative"
            style={{
                backgroundColor: `var(--${currentTheme}-background-200)`,
                border: `1px solid var(--${currentTheme}-card-border-color)`,
            }}
        >
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <ComponentSpinner />
                </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="flex items-start gap-2 w-full sm:w-auto">
                    <div
                        className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                        style={{
                            backgroundColor: `var(--${currentTheme}-background-100)`,
                        }}
                    >
                        <span className="text-xl sm:text-2xl">
                            {task.emoji || <FaTag />}
                        </span>
                    </div>
                    <div className="flex flex-col space-y-1 sm:space-y-2 flex-grow">
                        <span className="font-semibold text-base sm:text-lg line-clamp-1">
                            {task.taskName}
                        </span>
                        <div
                            className="p-2 rounded-lg w-full"
                            style={{
                                backgroundColor: `var(--${currentTheme}-background-100)`,
                            }}
                        >
                            <div className="font-medium text-xs sm:text-sm line-clamp-2">
                                {task.taskDescription || (
                                    <em>No description</em>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                    <div className="flex items-center text-xs sm:text-sm font-semibold">
                        <FaCalendarAlt className="mr-1" />
                        <span>
                            {task.archivedAt
                                ? new Date(task.archivedAt).toLocaleDateString()
                                : 'N/A'}
                        </span>
                    </div>
                    <div className="flex flex-row justify-end gap-2">
                        <button
                            className="rounded-lg btn btn-xs sm:btn-sm text-xs sm:text-sm flex items-center gap-1 hover:brightness-75 transition-all duration-300"
                            style={{
                                color: 'black',
                                backgroundColor: `var(--${currentTheme}-accent-green)`,
                            }}
                            onClick={() => {
                                setShowRecoverOptions(true);
                            }}
                        >
                            <FaUndo className="sm:mr-1" />
                            <span className="hidden sm:inline">Recover</span>
                        </button>
                        <button
                            className="rounded-lg btn btn-xs sm:btn-sm text-xs sm:text-sm flex items-center gap-1 hover:brightness-75 transition-all duration-300"
                            style={{
                                backgroundColor: `var(--${currentTheme}-background-100)`,
                                color: `var(--${currentTheme}-accent-red)`,
                            }}
                            onClick={() => {
                                initiateDeleteTask(task._id as string);
                            }}
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
            </div>
            {showRecoverOptions && (
                <div
                    ref={recoverOptionsRef}
                    className="absolute right-0 top-full mt-1 w-40 sm:w-48 rounded z-50"
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`,
                        border: `1px solid var(--${currentTheme}-accent-grey)`,
                    }}
                >
                    <div className="py-2 px-3 text-xs sm:text-sm">
                        Move to space:
                    </div>
                    <ul className="max-h-40 overflow-y-auto">
                        {spaces
                            .filter(
                                (space: SpaceData) => space._id !== task.space
                            )
                            .map((space: SpaceData) => (
                                <li
                                    key={space._id}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-black/20 cursor-pointer text-xs sm:text-sm"
                                    onClick={() =>
                                        handleRecoverTask(
                                            task._id || '',
                                            space._id || ''
                                        )
                                    }
                                >
                                    <div
                                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-white"
                                        style={{
                                            backgroundColor: space.color,
                                        }}
                                    ></div>
                                    <span className="truncate">
                                        {space.name}
                                    </span>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ArchivedTaskCard;
