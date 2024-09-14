import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import {
    convertSubtaskToTask,
    convertTaskToSubtask,
    updateTask,
} from '@/store/tasksSlice';
import { Task, TaskProgress } from '@/types';
import { ProgressDropdown } from './ProgressDropdown';
import { FaTrash } from 'react-icons/fa';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import SubtaskProgresses from './SubtaskProgresses';
import { useDrag, useDrop } from 'react-dnd';
import { store } from '@/store/store';
import { setSimplicityModalOpen } from '@/store/uiSlice';
import SimplicityModal from './SimplicityModal';

interface SubtaskDrawerCardProps {
    subtask: Task;
    position: string;
}

const SubtaskDrawerCard = React.memo(
    ({ subtask, position }: SubtaskDrawerCardProps) => {
        const dispatch = useDispatch<AppDispatch>();
        const [localSubtask, setLocalSubtask] = useState(subtask);
        const [isEditing, setIsEditing] = useState<string | null>(null);
        const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
        const currentTaskNameRef = useRef(subtask.taskName);
        const ref = useRef<HTMLLIElement>(null);
        const isSimplicityModalOpen = useSelector(
            (state: RootState) => state.ui.isSimplicityModalOpen
        );

        const [deletingTasks, setDeletingTasks] = useState<Set<string>>(
            new Set()
        );

        const { handleDelete } = useDeleteTask({
            deletingTasks,
            setDeletingTasks,
        });

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

                    if (item && dropResult.x && dropResult.y) {
                        dispatch(
                            convertSubtaskToTask({
                                subtask: { ...item },
                                dropPosition: dropResult,
                            })
                        );
                    }
                },
                collect: (monitor) => ({
                    isDragging: monitor.isDragging(),
                }),
            }),
            [localSubtask, dispatch, position]
        );

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
                    return;
                }
                // Check if the dropped task is already a parent of the target subtask
                const isAlreadyParent =
                    draggedSubtask.subtasks.length > 0 ||
                    (draggedSubtask.ancestors &&
                        draggedSubtask.ancestors.length > 1);

                console.log('targetSubtask', targetSubtask);
                console.log('draggedSubtask', draggedSubtask);

                if (draggedSubtask._id === targetSubtask._id) {
                    return;
                } else if (!isAlreadyParent) {
                    dispatch(
                        convertTaskToSubtask({
                            childTask: draggedSubtask,
                            parentTaskId: targetSubtask._id as string,
                        })
                    );
                } else {
                    dispatch(setSimplicityModalOpen(true));
                }
            },
            [dispatch, subtask]
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

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    inputRef.current &&
                    !inputRef.current.contains(event.target as Node)
                ) {
                    handleBlur();
                }
            };

            if (isEditing) {
                document.addEventListener('mousedown', handleClickOutside);
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [isEditing]);

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
            [dispatch, subtask._id]
        );

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
                style={{
                    opacity: isDragging ? 0.5 : 1,
                    cursor: 'move',
                }}
                className={`p-2 rounded-lg my-0 bg-base-100 transition-colors duration-200 shadow-md shadow-black/20 border-2 ${
                    isOver && !isDragging
                        ? 'filter brightness-110 border-blue-900'
                        : 'border-transparent'
                }`}
            >
                <div
                    className={`${
                        isEditing === 'taskName'
                            ? 'border-slate-400'
                            : 'border-transparent'
                    } ${
                        localSubtask.taskName === 'New Subtask'
                            ? 'text-neutral-500'
                            : ''
                    } font-semibold rounded-lg p-2 px-4 mb-2 bg-base-300 transition-colors duration-200 border-2`}
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
                        </h1>
                    )}
                </div>

                <div
                    className={`${
                        isEditing === 'taskDescription'
                            ? 'border-slate-400'
                            : 'border-transparent'
                    } font-normal rounded-lg p-2 px-4 mb-2 transition-all duration-200 bg-base-300 border-2`}
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
                            onClick={() => startEditing('taskDescription')}
                        >
                            {localSubtask.taskDescription || (
                                <span className="text-neutral-500">
                                    + Add description
                                </span>
                            )}
                        </p>
                    )}
                </div>
                <div className="flex justify-between items-center relative gap-2">
                    <ProgressDropdown
                        progress={subtask.progress}
                        onProgressChange={handleProgressChange}
                        isSubtask={true}
                    />
                    <SubtaskProgresses task={subtask} />
                    <FaTrash
                        className="cursor-pointer text-red-500"
                        onClick={() => handleDelete(subtask._id as string)}
                    />
                </div>
                <SimplicityModal
                    isOpen={isSimplicityModalOpen}
                    onClose={() => dispatch(setSimplicityModalOpen(false))}
                />
            </li>
        );
    }
);

export default SubtaskDrawerCard;
