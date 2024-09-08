// src/components/TaskCard.tsx
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import debounce from 'lodash.debounce';
import {
    updateTask,
    deleteTask,
    addTask,
    updateLocalTask,
    removeLocalTask,
} from '../store/tasksSlice';
import { AppDispatch, RootState } from '../store/store';
import TaskCardToolBar from './TaskCardToolBar';
import { Task, TaskProgress } from '@/types';
import DraggableArea from './DraggableArea';
import { setGlobalDragging, setDraggingCardId } from '../store/uiSlice';

interface TaskCardProps {
    task: Task;
    onDragStart: () => void;
    onDragStop: () => void;
    isVirgin?: boolean;
    getNewZIndex: () => number;
}

const TaskCard: React.FC<TaskCardProps> = ({
    task,
    onDragStart,
    onDragStop,
    isVirgin = false,
    getNewZIndex,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const isGlobalDragging = useSelector(
        (state: RootState) => state.ui.isGlobalDragging
    );
    const draggingCardId = useSelector(
        (state: RootState) => state.ui.draggingCardId
    );
    const [localTask, setLocalTask] = useState(task);
    const [isHovering, setIsHovering] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [deletingTasks, setDeletingTasks] = useState<Set<string>>(new Set());

    const [cardSize, setCardSize] = useState<{ width: number; height: number }>(
        {
            width: 240,
            height: 200,
        }
    );
    const cardRef = useRef<HTMLDivElement>(null);
    const resizingRef = useRef(false);
    const startPosRef = useRef({ x: 0, y: 0 });
    const startSizeRef = useRef({ width: 0, height: 0 });

    const taskNameRef = useRef<HTMLInputElement>(null);
    const taskDescriptionRef = useRef<HTMLTextAreaElement>(null);

    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isDropped, setIsDropped] = useState(false);

    const updateTaskInStore = useCallback(
        (updatedTask: Task) => {
            if (isVirgin) {
                if (updatedTask.taskName || updatedTask.taskDescription) {
                    dispatch(addTask(updatedTask));
                } else {
                    dispatch(updateLocalTask(updatedTask));
                }
            } else {
                dispatch(updateTask(updatedTask));
            }
        },
        [dispatch, isVirgin]
    );

    const debouncedUpdate = useCallback(
        debounce((updatedTask: Task) => {
            updateTaskInStore(updatedTask);
        }, 500),
        [updateTaskInStore]
    );

    const handleDragStart = useCallback(
        (e: DraggableEvent, data: DraggableData) => {
            const newZIndex = getNewZIndex();
            setLocalTask((prevTask) => ({ ...prevTask, zIndex: newZIndex }));
            dispatch(setGlobalDragging(true));
            dispatch(setDraggingCardId(task._id ?? ''));
            onDragStart();
        },
        [getNewZIndex, onDragStart, dispatch, task._id]
    );

    const handleDragStop = useCallback(
        (e: DraggableEvent, data: DraggableData) => {
            setLocalTask((prevTask) => {
                const newTask = { ...prevTask, x: data.x, y: data.y };
                debouncedUpdate(newTask);
                return newTask;
            });
            dispatch(setGlobalDragging(false));
            dispatch(setDraggingCardId(null));
            onDragStop();
        },
        [debouncedUpdate, onDragStop, dispatch, task._id]
    );

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (
                isGlobalDragging &&
                draggingCardId !== task._id &&
                cardRef.current
            ) {
                const elementsUnderCursor = document.elementsFromPoint(
                    e.clientX,
                    e.clientY
                );
                const cardsUnderCursor = elementsUnderCursor.filter((el) =>
                    el.classList.contains('task-card')
                );

                if (
                    cardsUnderCursor.length > 0 &&
                    cardsUnderCursor[1] === cardRef.current
                ) {
                    setIsDraggingOver(true);
                } else {
                    setIsDraggingOver(false);
                }
            }
        };

        const handleGlobalMouseUp = () => {
            if (isDraggingOver) {
                setIsDropped(true);
                // AI TASK MERGE
                // dispatch(
                //     mergeTasks({
                //         targetTaskId: task._id,
                //         sourceTaskId: draggingCardId,
                //     })
                // );

                // Here you can add logic to handle the drop, e.g., updating task relationships
                setTimeout(() => {
                    setIsDropped(false);
                }, 500);
            }
            setIsDraggingOver(false);
        };

        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isGlobalDragging, draggingCardId, task._id, isDraggingOver, dispatch]);

    const updateCardSize = useCallback(() => {
        if (
            taskNameRef.current &&
            taskDescriptionRef.current &&
            cardRef.current
        ) {
            const nameWidth = taskNameRef.current.scrollWidth;
            const descriptionScrollHeight =
                taskDescriptionRef.current.scrollHeight;

            const newWidth = Math.max(nameWidth, 240);
            const newHeight = descriptionScrollHeight + 120; // Add extra space for name input and toolbar

            setCardSize((prev) => ({
                width: Math.min(Math.max(newWidth + 32, prev.width), 350),
                height: Math.min(Math.max(newHeight, prev.height, 200), 500), // Min 200px, max 500px
            }));

            // Adjust textarea height to match content or card size
            const maxTextareaHeight = cardSize.height - 120; // Subtract space for name input and toolbar
            taskDescriptionRef.current.style.height = `${Math.min(
                descriptionScrollHeight,
                maxTextareaHeight
            )}px`;
        }
    }, [cardSize.height]);

    useEffect(() => {
        updateCardSize();
    }, [localTask.taskName, localTask.taskDescription, updateCardSize]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const updatedFields = { [e.target.name]: e.target.value };
            setLocalTask((prevTask) => {
                const newTask = { ...prevTask, ...updatedFields };
                debouncedUpdate(newTask);
                return newTask;
            });
            updateCardSize();
        },
        [debouncedUpdate, updateCardSize]
    );

    const handleProgressChange = useCallback(
        (newProgress: TaskProgress) => {
            setLocalTask((prevTask) => {
                const newTask = { ...prevTask, progress: newProgress };
                debouncedUpdate(newTask);
                return newTask;
            });
        },
        [debouncedUpdate]
    );

    const handleDelete = useCallback(
        async (taskId: string) => {
            if (deletingTasks.has(taskId)) return;

            if (isVirgin) {
                dispatch(removeLocalTask(localTask._id ?? ''));
                return;
            }

            setDeletingTasks((prev) => new Set(prev).add(taskId));
            try {
                await dispatch(deleteTask(taskId)).unwrap();
            } finally {
                setDeletingTasks((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(taskId);
                    return newSet;
                });
            }
        },
        [deletingTasks, dispatch, isVirgin, localTask._id]
    );

    const handleCardClick = useCallback(() => {
        const newZIndex = getNewZIndex();
        setLocalTask((prevTask) => {
            const newTask = { ...prevTask, zIndex: newZIndex };
            updateTaskInStore(newTask);
            return newTask;
        });
    }, [getNewZIndex, updateTaskInStore]);

    // Use it or lose it
    const useFadeOutEffect = (
        localTask: Task,
        isHovering: boolean,
        isFocused: boolean,
        handleDelete: (id: string) => void
    ) => {
        const [opacity, setOpacity] = useState(1);
        const timeoutRef = useRef<NodeJS.Timeout | null>(null);

        useEffect(() => {
            let fadeInterval: NodeJS.Timeout;
            const shouldFadeOut =
                !isHovering &&
                !isFocused &&
                !localTask.taskName &&
                !localTask.taskDescription;

            if (shouldFadeOut) {
                timeoutRef.current = setTimeout(() => {
                    fadeInterval = setInterval(() => {
                        setOpacity((prevOpacity) => {
                            if (prevOpacity <= 0) {
                                clearInterval(fadeInterval);
                                handleDelete(localTask._id ?? '');
                                return 0;
                            }
                            return prevOpacity - 0.1;
                        });
                    }, 100);
                }, 3000);
            } else {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                setOpacity(1);
            }

            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                if (fadeInterval) {
                    clearInterval(fadeInterval);
                }
            };
        }, [
            isHovering,
            isFocused,
            localTask.taskName,
            localTask.taskDescription,
            handleDelete,
            localTask._id,
        ]);

        return opacity;
    };

    const opacity = useFadeOutEffect(
        localTask,
        isHovering,
        isFocused,
        handleDelete
    );

    const setIsHoveringCallback = useCallback(
        (value: boolean) => setIsHovering(value),
        []
    );
    const setIsFocusedCallback = useCallback(
        (value: boolean) => setIsFocused(value),
        []
    );

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const isRightEdge = e.clientX > rect.right - 10;
            const isBottomEdge = e.clientY > rect.bottom - 10;
            if (isRightEdge || isBottomEdge) {
                resizingRef.current = true;
                startPosRef.current = { x: e.clientX, y: e.clientY };
                startSizeRef.current = {
                    width: rect.width,
                    height: rect.height,
                };
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (resizingRef.current && cardRef.current) {
            const dx = e.clientX - startPosRef.current.x;
            const dy = e.clientY - startPosRef.current.y;
            const newWidth = Math.min(
                Math.max(startSizeRef.current.width + dx, 150),
                350
            );
            const newHeight = Math.min(
                Math.max(startSizeRef.current.height + dy, 200),
                500
            );
            setCardSize({ width: newWidth, height: newHeight });
        }
    }, []);

    useEffect(() => {
        const handleMouseUp = () => {
            resizingRef.current = false;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove]);

    return (
        <Draggable
            defaultPosition={{ x: task.x, y: task.y }}
            bounds="parent"
            handle=".draggable-area"
            onStart={handleDragStart}
            onStop={handleDragStop}
        >
            <div
                ref={cardRef}
                className={`task-card absolute bg-base-300 shadow cursor-move flex flex-col space-y-2 rounded-xl border-4 ${
                    isDraggingOver
                        ? ' border-blue-500'
                        : isDropped
                        ? ' border-green-500'
                        : 'border-base-300'
                }`}
                style={{
                    opacity,
                    zIndex: localTask.zIndex,
                    width: `${cardSize.width}px`,
                    height: `${cardSize.height}px`,
                    transition:
                        'width 0.1s ease-out, height 0.2s ease-out, border-color 0.3s ease',
                    resize: 'both',
                    overflow: 'auto',
                    minWidth: '250px',
                    maxWidth: '350px',
                    minHeight: '230px',
                    maxHeight: '500px',
                }}
                onClick={handleCardClick}
                onMouseDown={handleMouseDown}
                onMouseEnter={() => setIsHoveringCallback(true)}
                onMouseLeave={() => setIsHoveringCallback(false)}
            >
                <div className="flex flex-col h-full">
                    <DraggableArea className="flex flex-col h-full p-4">
                        <input
                            ref={taskNameRef}
                            type="text"
                            name="taskName"
                            placeholder="Task Name"
                            value={localTask.taskName}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocusedCallback(true)}
                            onBlur={() => setIsFocusedCallback(false)}
                            className="input input-bordered w-full p-4 pt-2 pb-2 h-8 mb-2 resize-none"
                            maxLength={35}
                        />
                        <textarea
                            ref={taskDescriptionRef}
                            name="taskDescription"
                            placeholder="Task Description"
                            value={localTask.taskDescription}
                            onChange={(e) => {
                                handleInputChange(e);
                                updateCardSize(); // Call updateCardSize on each change
                            }}
                            onFocus={() => setIsFocusedCallback(true)}
                            onBlur={() => setIsFocusedCallback(false)}
                            className="textarea textarea-bordered w-full p-4 pt-2 pb-2 resize-none flex-grow"
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                minHeight: '100px',
                                maxHeight: `${cardSize.height}px`, // Subtract space for name input and toolbar
                                overflowY: 'auto', // Allow scrolling if content exceeds maxHeight
                            }}
                            maxLength={500}
                        />
                        <TaskCardToolBar
                            onDelete={() => handleDelete(task._id ?? '')}
                            progress={localTask.progress}
                            onProgressChange={handleProgressChange}
                        />
                    </DraggableArea>
                </div>
            </div>
        </Draggable>
    );
};

export default TaskCard;
