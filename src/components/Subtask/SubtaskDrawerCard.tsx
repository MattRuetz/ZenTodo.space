// src/components/Subtask/SubtaskDrawerCard.tsx
import React, { useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { updateTask } from '@/store/tasksSlice';
import { Task, TaskProgress } from '@/types';
import { useDrag, useDrop } from 'react-dnd';
import { setSimplicityModalOpen, setSubtaskDrawerOpen } from '@/store/uiSlice';
import { SubtaskTopBar } from './SubtaskTopBar';
import SubtaskBottomBar from './SubtaskBottomBar';
import { useChangeHierarchy } from '@/hooks/useChangeHierarchy';
import { useMoveSubtask } from '@/hooks/useMoveSubtask';
import { useAlert } from '@/hooks/useAlert';
import useClickOutside from '@/hooks/useClickOutside';
import { useTheme } from '@/hooks/useTheme';
import { useArchiveTask } from '@/hooks/useArchiveTask';
import { useClearFilters } from '@/hooks/useClearFilters';
import { createSelector } from '@reduxjs/toolkit';
import { selectAllTasks } from '@/store/selectors';

interface SubtaskDrawerCardProps {
    subtask: Task;
    position: string;
    maxZIndex: number;
    setCurrentEmojiTask: (currentEmojiTask: string | null) => void;
    setIsEmojiPickerOpen: (isEmojiPickerOpen: boolean) => void;
}

// Memoized selectors
const parentTaskSelector = createSelector(
    (state: RootState, parentTaskId: string) =>
        state.tasks.tasks.find((task) => task._id === parentTaskId),
    (parentTask) => parentTask
);

const SubtaskDrawerCard: React.FC<SubtaskDrawerCardProps> = React.memo(
    ({
        subtask,
        position,
        maxZIndex,
        setIsEmojiPickerOpen,
        setCurrentEmojiTask,
    }) => {
        const dispatch = useDispatch<AppDispatch>();
        const tasksState = useSelector(selectAllTasks);
        const spacesState = useSelector(
            (state: RootState) => state.spaces.spaces
        );

        const parentTask = useSelector((state: RootState) =>
            parentTaskSelector(state, subtask.parentTask as string)
        );

        const currentTheme = useTheme();
        const { showAlert } = useAlert();

        const archiveTask = useArchiveTask({ tasksState, spacesState });
        const { clearFilters } = useClearFilters(subtask.space as string);

        const [localSubtask, setLocalSubtask] = useState(subtask);
        const [isEditing, setIsEditing] = useState<string | null>(null);
        const [isSubtaskMenuOpen, setIsSubtaskMenuOpen] = useState(false);

        const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
        const currentTaskNameRef = useRef(subtask?.taskName || '');
        const ref = useRef<HTMLLIElement>(null);

        const { commitSubtaskOrder } = useMoveSubtask();
        const { convertTaskToSubtask, convertSubtaskToTask } =
            useChangeHierarchy();

        const handleConvertTaskToSubtask = useCallback(
            (task: Task, parentTaskId: string) => {
                convertTaskToSubtask(task, parentTaskId);
            },
            [convertTaskToSubtask]
        );

        const handleConvertSubtaskToTask = useCallback(
            (
                subtask: Task,
                dropPosition: { x: number; y: number } | undefined
            ) => {
                convertSubtaskToTask(
                    {
                        ...subtask,
                        zIndex: maxZIndex ? maxZIndex + 1 : 0,
                    },
                    dropPosition,
                    tasksState
                );
                clearFilters();
            },
            [convertSubtaskToTask, maxZIndex, tasksState, clearFilters]
        );

        const handleArchive = useCallback(() => {
            archiveTask(subtask);
            dispatch(setSubtaskDrawerOpen(false));
        }, [archiveTask, subtask, dispatch]);

        const [{ isDragging }, drag] = useDrag(
            () => ({
                type: 'SUBTASK',
                item: () => {
                    if (
                        document.activeElement instanceof HTMLInputElement ||
                        document.activeElement instanceof HTMLTextAreaElement
                    ) {
                        return undefined; // Disable dragging
                    }
                    return { ...localSubtask, position };
                },
                end: (item, monitor) => {
                    const dropResult = monitor.getDropResult() as {
                        x: number;
                        y: number;
                    };
                    if (
                        item &&
                        dropResult &&
                        dropResult.x !== undefined &&
                        dropResult.y !== undefined
                    ) {
                        handleConvertSubtaskToTask({ ...item }, dropResult);
                    }
                },
                collect: (monitor) => ({
                    isDragging: monitor.isDragging(),
                }),
            }),
            [localSubtask, position]
        );

        const handleDropOnSelf = useCallback(() => {
            if (parentTask && parentTask._id) {
                commitSubtaskOrder(parentTask._id);
            }
        }, [parentTask, commitSubtaskOrder]);

        const handleDrop = useCallback(
            (item: Task) => {
                const targetSubtask = subtask;
                const draggedSubtask = tasksState.find(
                    (task) => task._id === item._id
                );

                if (!draggedSubtask) {
                    console.error('Dragged subtask not found in the store');
                    showAlert('An unknown error occurred', 'error');
                    return;
                }

                const isAlreadyParent =
                    draggedSubtask.subtasks.length > 0 ||
                    (draggedSubtask.ancestors &&
                        draggedSubtask.ancestors.length > 1);

                if (draggedSubtask._id === targetSubtask._id) {
                    handleDropOnSelf();
                    return;
                } else if (!isAlreadyParent) {
                    handleConvertTaskToSubtask(
                        draggedSubtask,
                        targetSubtask._id as string
                    );
                    setLocalSubtask((prevSubtask) => ({
                        ...prevSubtask,
                        subtasks: [
                            ...prevSubtask.subtasks,
                            draggedSubtask._id as string,
                        ],
                    }));
                } else {
                    dispatch(setSimplicityModalOpen(true));
                }
            },
            [dispatch, subtask, handleConvertTaskToSubtask, tasksState]
        );

        const [{ isOver }, drop] = useDrop(
            () => ({
                accept: 'SUBTASK',
                drop: (item: Task) => handleDrop(item),
                collect: (monitor) => ({
                    isOver: !!monitor.isOver(),
                }),
            }),
            [handleDrop]
        );

        drag(drop(ref));

        useClickOutside([inputRef], () => handleBlur());

        const handleBlur = useCallback(() => {
            if (!subtask._id) return;

            let updatedFields: Partial<Task> = {};

            if (isEditing === 'taskName') {
                const trimmedTaskName = currentTaskNameRef.current.trim();
                if (!trimmedTaskName) {
                    setLocalSubtask((prevSubtask) => ({
                        ...prevSubtask,
                        taskName: subtask.taskName,
                    }));
                    currentTaskNameRef.current = subtask.taskName;
                } else if (trimmedTaskName !== subtask.taskName) {
                    updatedFields.taskName = trimmedTaskName;
                }
            } else if (isEditing === 'taskDescription') {
                const trimmedDescription =
                    localSubtask.taskDescription?.trim() || '';
                if (trimmedDescription !== subtask.taskDescription) {
                    updatedFields.taskDescription = trimmedDescription;
                }
            }

            if (Object.keys(updatedFields).length > 0) {
                dispatch(updateTask({ _id: subtask._id, ...updatedFields }));
            }

            setIsEditing(null);
        }, [dispatch, isEditing, subtask, localSubtask.taskDescription]);

        const handleProgressChange = useCallback(
            (newProgress: TaskProgress) => {
                if (!subtask._id) return;
                const updatedFields = { progress: newProgress };
                dispatch(updateTask({ _id: subtask._id, ...updatedFields }));
                setLocalSubtask((prev) => ({ ...prev, progress: newProgress }));
            },
            [dispatch, subtask]
        );

        const handleSetDueDate = (date: Date | undefined) => {
            if (!subtask._id) return;
            dispatch(updateTask({ _id: subtask._id, dueDate: date || null }));
        };

        const handleContextMenu = useCallback((e: React.MouseEvent) => {
            e.preventDefault();
            setIsSubtaskMenuOpen(true);
        }, []);

        const handleInputChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const { name, value } = e.target;
                if (name === 'taskName') {
                    currentTaskNameRef.current = value;
                }
                setLocalSubtask((prevSubtask) => ({
                    ...prevSubtask,
                    [name]: value,
                }));
            },
            []
        );

        const startEditing = useCallback((fieldName: string) => {
            setIsEditing(fieldName);
        }, []);

        return (
            <li
                ref={ref}
                key={subtask._id}
                onContextMenu={handleContextMenu}
                className={`p-2 rounded-lg my-0 transition-colors duration-200 shadow-md border-2 relative`}
                style={{
                    opacity: isDragging ? 0.5 : 1,
                    cursor: 'move',
                    backgroundColor: `var(--${currentTheme}-background-100)`,
                    borderColor:
                        isOver && !isDragging
                            ? `var(--${currentTheme}-accent-blue)`
                            : `var(--${currentTheme}-card-border-color)`,
                }}
            >
                <SubtaskTopBar
                    subtask={subtask}
                    handleSetDueDate={handleSetDueDate}
                    isSubtaskMenuOpen={isSubtaskMenuOpen}
                    setIsSubtaskMenuOpen={setIsSubtaskMenuOpen}
                    setCurrentEmojiTask={setCurrentEmojiTask}
                    setIsEmojiPickerOpen={setIsEmojiPickerOpen}
                />
                <div
                    className={`${
                        isEditing === 'taskName'
                            ? 'border-slate-400'
                            : 'border-transparent'
                    } font-semibold rounded-lg py-1 px-2 mb-2 transition-colors duration-200 border-2`}
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`,
                        borderColor:
                            isEditing === 'taskName'
                                ? `var(--${currentTheme}-accent-grey)`
                                : localSubtask.taskName === 'New Subtask'
                                ? `var(--${currentTheme}-accent-red)`
                                : 'transparent',
                        color: `var(--${currentTheme}-text-default)`,
                    }}
                >
                    {isEditing === 'taskName' ? (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type="text"
                            name="taskName"
                            value={localSubtask.taskName}
                            onChange={handleInputChange}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.currentTarget.blur();
                                }
                            }}
                            onBlur={handleBlur}
                            className="w-full resize-none border-none outline-none bg-transparent"
                            maxLength={30}
                            onFocus={(event) => event.target.select()}
                            autoFocus
                        />
                    ) : (
                        <h1
                            className="cursor-pointer"
                            onClick={() => startEditing('taskName')}
                        >
                            {localSubtask.taskName}
                            {localSubtask.taskName === 'New Subtask' && (
                                <>
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: `var(--${currentTheme}-text-subtle)`,
                                            opacity: 0.5,
                                        }}
                                    >
                                        Click to change name
                                    </p>
                                </>
                            )}
                        </h1>
                    )}
                </div>
                <div
                    className={`${
                        isEditing === 'taskDescription'
                            ? 'border-slate-400'
                            : 'border-transparent'
                    } font-normal rounded-lg py-2 px-2 mb-2 transition-all duration-200 border-2`}
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
                        borderColor:
                            isEditing === 'taskDescription'
                                ? `var(--${currentTheme}-accent-grey)` // Use theme color
                                : 'transparent',
                    }}
                >
                    {isEditing === 'taskDescription' ? (
                        <textarea
                            ref={
                                inputRef as React.RefObject<HTMLTextAreaElement>
                            }
                            name="taskDescription"
                            value={localSubtask.taskDescription}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full resize-none flex-grow outline-none text-sm bg-transparent"
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                minHeight: '100px',
                                maxHeight: '500px',
                                overflowY: 'auto',
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                            maxLength={500}
                            autoFocus
                        />
                    ) : (
                        <p
                            className="text-sm cursor-pointer max-h-[200px] overflow-y-auto"
                            style={{
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                                whiteSpace: 'pre-wrap', // Preserve whitespace and newlines
                            }}
                            onClick={() => startEditing('taskDescription')}
                        >
                            {localSubtask.taskDescription || (
                                <span
                                    className="text-xs"
                                    style={{
                                        color: `var(--${currentTheme}-text-subtle)`,
                                        opacity: 0.5,
                                    }}
                                >
                                    + Add description
                                </span>
                            )}
                        </p>
                    )}
                </div>
                <SubtaskBottomBar
                    subtask={subtask}
                    handleProgressChange={handleProgressChange}
                    handleSetDueDate={handleSetDueDate}
                    handleArchive={handleArchive}
                />
            </li>
        );
    }
);

export default SubtaskDrawerCard;
