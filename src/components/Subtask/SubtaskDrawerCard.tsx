import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '../../store/store';
import { updateTask } from '@/store/tasksSlice';
import { Task, TaskProgress } from '@/types';
import { useDrag, useDrop } from 'react-dnd';
import { store } from '@/store/store';
import { setSimplicityModalOpen } from '@/store/uiSlice';
import { SubtaskTopBar } from './SubtaskTopBar';
import { SubtaskBottomBar } from './SubtaskBottomBar';
import { useChangeHierarchy } from '@/hooks/useChangeHierarchy';
import { useMoveSubtask } from '@/hooks/useMoveSubtask';
import { useAlert } from '@/hooks/useAlert';
import useClickOutside from '@/hooks/useClickOutside';
import { useTheme } from '@/hooks/useTheme';
interface SubtaskDrawerCardProps {
    subtask: Task;
    position: string;
}

const SubtaskDrawerCard = React.memo(
    ({ subtask, position }: SubtaskDrawerCardProps) => {
        const dispatch = useDispatch<AppDispatch>();
        const currentTheme = useTheme();
        const { showAlert } = useAlert();

        const [localSubtask, setLocalSubtask] = useState(subtask || {});
        const [isEditing, setIsEditing] = useState<string | null>(null);
        const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
        const currentTaskNameRef = useRef(subtask?.taskName || '');
        const ref = useRef<HTMLLIElement>(null);

        const { commitSubtaskOrder } = useMoveSubtask();

        const parentTask = useSelector((state: RootState) =>
            state.tasks.tasks.find((task) => task._id === subtask.parentTask)
        );

        const { convertTaskToSubtask, convertSubtaskToTask } =
            useChangeHierarchy();

        const handleConvertTaskToSubtask = (
            task: Task,
            parentTaskId: string
        ) => {
            convertTaskToSubtask(task, parentTaskId);
        };

        const handleConvertSubtaskToTask = (
            subtask: Task,
            dropPosition: { x: number; y: number } | undefined
        ) => {
            convertSubtaskToTask(subtask, dropPosition);
        };

        const [{ isDragging }, drag] = useDrag(
            () => ({
                type: 'SUBTASK',
                item: () => {
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
            [localSubtask, dispatch, position]
        );

        const handleDropOnSelf = useCallback(() => {
            console.log('parentTask', parentTask?.taskName);
            if (parentTask && parentTask._id) {
                commitSubtaskOrder(parentTask._id);
            }
        }, [parentTask, commitSubtaskOrder]);

        const handleDrop = useCallback(
            (item: Task) => {
                const targetSubtask = subtask;
                // Fetch the latest version of the dragged task from the Redux store
                const state = store.getState() as RootState;
                const draggedSubtask = state.tasks.tasks.find(
                    (task) => task._id === item._id
                );

                if (!draggedSubtask) {
                    console.error('Dragged subtask not found in the store');
                    showAlert('An unknown error occurred', 'error');
                    return;
                }
                // Check if the dropped task is already a parent of the target subtask
                const isAlreadyParent =
                    draggedSubtask.subtasks.length > 0 ||
                    (draggedSubtask.ancestors &&
                        draggedSubtask.ancestors.length > 1);

                if (draggedSubtask._id === targetSubtask._id) {
                    // If it drops on itself, change order
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
                            draggedSubtask,
                        ] as string[],
                    }));
                } else {
                    dispatch(setSimplicityModalOpen(true));
                }
            },
            [dispatch, subtask, localSubtask]
        );

        const [{ isOver }, drop] = useDrop(
            () => ({
                accept: 'SUBTASK',
                drop: (item: Task) => {
                    handleDrop(item);
                },
                collect: (monitor) => ({
                    isOver: !!monitor.isOver(),
                }),
            }),
            [handleDrop]
        );

        drag(drop(ref));

        useClickOutside([inputRef], () => handleBlur());

        const handleBlur = useCallback(() => {
            if (
                isEditing === 'taskName' &&
                !currentTaskNameRef.current.trim()
            ) {
                setLocalSubtask((prevSubtask) => ({
                    ...prevSubtask,
                    taskName: subtask.taskName,
                }));
                currentTaskNameRef.current = subtask.taskName;
            } else if (isEditing && subtask._id) {
                const updatedFields = {
                    [isEditing]: currentTaskNameRef.current,
                };
                dispatch(updateTask({ _id: subtask._id, ...updatedFields }));
            }
            setIsEditing(null);
        }, [dispatch, isEditing, subtask]);

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
                ref={ref as unknown as React.RefObject<HTMLLIElement>}
                key={subtask._id}
                className={`p-2 rounded-lg my-0 transition-colors duration-200 shadow-md border-2 relative`}
                style={{
                    opacity: isDragging ? 0.5 : 1,
                    cursor: 'move',
                    backgroundColor: `var(--${currentTheme}-background-100)`, // Use theme color
                    borderColor:
                        isOver && !isDragging
                            ? `var(--${currentTheme}-accent-blue)` // Use theme color
                            : `var(--${currentTheme}-background-300)`, // Use theme color
                }}
            >
                <SubtaskTopBar
                    subtask={subtask}
                    handleProgressChange={handleProgressChange}
                    handleSetDueDate={handleSetDueDate}
                />
                <div
                    className={`${
                        isEditing === 'taskName'
                            ? 'border-slate-400'
                            : 'border-transparent'
                    } font-semibold rounded-lg p-2 px-4 mb-2 transition-colors duration-200 border-2`}
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
                        borderColor:
                            isEditing === 'taskName'
                                ? `var(--${currentTheme}-accent-grey)` // Use theme color
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
                    } font-normal rounded-lg p-2 px-4 mb-2 transition-all duration-200 border-2`}
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
                            }}
                            maxLength={500}
                            autoFocus
                        />
                    ) : (
                        <p
                            className="text-sm cursor-pointer"
                            style={{
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
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
                />
            </li>
        );
    }
);

export default SubtaskDrawerCard;
