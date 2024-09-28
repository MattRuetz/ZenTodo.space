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
            className="p-4 rounded-lg shadow-md"
            style={{
                backgroundColor: `var(--${currentTheme}-background-200)`,
                border: `1px solid var(--${currentTheme}-card-border-color)`,
            }}
        >
            {isLoading && (
                <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
                    <ComponentSpinner />
                </div>
            )}
            <div className="flex flex-row justify-between gap-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 col-span-2">
                        <div
                            className="flex items-center justify-center w-12 h-12 rounded-full"
                            style={{
                                backgroundColor: `var(--${currentTheme}-background-100)`,
                            }}
                        >
                            <span className="text-2xl">
                                {task.emoji || <FaTag />}
                            </span>
                        </div>
                        <div className="flex flex-col space-y-2 max-w-[400px]">
                            <span className="font-semibold text-lg">
                                {task.taskName}
                            </span>
                            <div
                                className="p-2 rounded-lg w-full"
                                style={{
                                    backgroundColor: `var(--${currentTheme}-background-100)`,
                                }}
                            >
                                <div className="font-medium text-sm truncate">
                                    {task.taskDescription || (
                                        <em>No description</em>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-rows-2 gap-2 col-span-2">
                    <div className="flex flex-col">
                        <div
                            className="flex items-center justify-center gap-2 text-sm font-semibold"
                            data-tooltip-id="archived-task-card-date"
                            data-tooltip-place="top"
                        >
                            {isApproachingDeletion(
                                task.archivedAt?.toString() || ''
                            ) ? (
                                <>
                                    <FaExclamationTriangle
                                        style={{
                                            color: `var(--${currentTheme}-accent-red)`,
                                        }}
                                    />
                                    <Tooltip id="archived-task-card-date">
                                        {getDaysUntilDeletion(
                                            task.archivedAt?.toString() || ''
                                        )}{' '}
                                        days until deletion
                                    </Tooltip>
                                </>
                            ) : (
                                <FaCalendarAlt />
                            )}
                            Archived:
                            <span>
                                <span>
                                    {task.archivedAt
                                        ? new Date(
                                              task.archivedAt
                                          ).toLocaleDateString()
                                        : 'N/A'}
                                </span>
                            </span>
                        </div>
                    </div>
                    <div className="relative flex flex-row justify-end gap-2">
                        <button
                            className="rounded-lg btn btn-sm text-sm flex items-center align-start gap-2 hover:brightness-75 transition-all duration-300"
                            style={{
                                color: `var(--${currentTheme}-emphasis-dark)`,
                                backgroundColor: `var(--${currentTheme}-accent-green)`,
                            }}
                            onClick={() => {
                                setShowRecoverOptions(true);
                            }}
                        >
                            <FaUndo />
                            Recover
                        </button>
                        <button
                            className="rounded-lg btn btn-sm text-sm flex items-center align-start gap-2 hover:brightness-75 transition-all duration-300"
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
                        {showRecoverOptions && (
                            <div
                                ref={recoverOptionsRef}
                                className="absolute right-0 mt-8 w-48 rounded z-50"
                                style={{
                                    backgroundColor: `var(--${currentTheme}-background-200)`,
                                    border: `1px solid var(--${currentTheme}-accent-grey)`,
                                }}
                            >
                                <div className="py-2 px-4">Move to space:</div>
                                <ul>
                                    {spaces
                                        .filter(
                                            (space: SpaceData) =>
                                                space._id !== task.space
                                        )
                                        .map((space: SpaceData) => (
                                            <li
                                                key={space._id}
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-black/20 cursor-pointer"
                                                onClick={() =>
                                                    handleRecoverTask(
                                                        task._id || '',
                                                        space._id || ''
                                                    )
                                                }
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full border border-white"
                                                    style={{
                                                        backgroundColor:
                                                            space.color,
                                                    }}
                                                ></div>
                                                {space.name}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchivedTaskCard;
