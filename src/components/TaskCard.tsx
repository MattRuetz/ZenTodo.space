// src/components/TaskCard.tsx
'use client';

import React, {
    useState,
    useCallback,
    useRef,
    useEffect,
    useMemo,
} from 'react';
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
import { useThrottle } from '@/hooks/useThrottle';

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
        (updatedFields: Partial<Task>) => {
            if (isVirgin) {
                if (updatedFields.taskName || updatedFields.taskDescription) {
                    dispatch(addTask({ ...task, ...updatedFields }));
                } else {
                    dispatch(updateLocalTask({ ...task, ...updatedFields }));
                }
            } else {
                task._id &&
                    dispatch(updateTask({ _id: task._id, ...updatedFields }));
            }
        },
        [dispatch, isVirgin, task]
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
        [debouncedUpdate, onDragStop, dispatch]
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
                // SUBTASK ADDING

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

            const newWidth = Math.min(Math.max(nameWidth, 240) + 32, 350);
            const newHeight = Math.min(
                Math.max(descriptionScrollHeight + 120, 200),
                500
            );

            setCardSize((prev) => {
                if (prev.width !== newWidth || prev.height !== newHeight) {
                    return { width: newWidth, height: newHeight };
                }
                return prev;
            });

            // Adjust textarea height
            taskDescriptionRef.current.style.height = `${Math.min(
                descriptionScrollHeight,
                newHeight - 120
            )}px`;
        }
    }, []);

    useEffect(() => {
        updateCardSize();
    }, [localTask.taskName, localTask.taskDescription, updateCardSize]);

    const handleInputBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const fieldName = e.target.name;
            const fieldValue = e.target.value;

            setTimeout(() => {
                if (!isFocused) {
                    const updatedFields = { [fieldName]: fieldValue };
                    setLocalTask((prevTask) => {
                        const newTask = { ...prevTask, ...updatedFields };
                        debouncedUpdate(newTask);
                        return newTask;
                    });
                    updateCardSize();
                }
            }, 100); // 100ms delay, adjust as needed
        },
        [debouncedUpdate, updateCardSize, isFocused]
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
            const updatedTask = { ...prevTask, zIndex: newZIndex };
            if (updatedTask._id) {
                dispatch(
                    updateTask({ _id: updatedTask._id, zIndex: newZIndex })
                );
            }
            return updatedTask;
        });
    }, [getNewZIndex, dispatch]);

    const useFadeOutEffect = useCallback(
        (localTask: Task, isHovering: boolean, isFocused: boolean) => {
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
        },
        [handleDelete]
    );

    const opacity = useFadeOutEffect(localTask, isHovering, isFocused);

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

    const throttledSetCardSize = useThrottle(setCardSize, 50);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
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
                throttledSetCardSize({ width: newWidth, height: newHeight });
            }
        },
        [throttledSetCardSize]
    );

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

    const cardStyle: React.CSSProperties = useMemo(
        () => ({
            opacity,
            zIndex: localTask.zIndex,
            width: `${cardSize.width}px`,
            height: `${cardSize.height}px`,
            transition: 'border-color 0.3s ease',
            resize: 'both',
            overflow: 'auto',
            minWidth: '250px',
            maxWidth: '500px',
            minHeight: '230px',
            maxHeight: '500px',
        }),
        [opacity, localTask.zIndex, cardSize.width, cardSize.height]
    );

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
                style={cardStyle}
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
                            onChange={(e) => {
                                setLocalTask((prev) => ({
                                    ...prev,
                                    taskName: e.target.value,
                                }));
                            }}
                            onFocus={() => setIsFocusedCallback(true)}
                            onBlur={handleInputBlur}
                            className="input input-bordered w-full p-4 pt-2 pb-2 h-8 mb-2 resize-none"
                            maxLength={35}
                        />
                        <textarea
                            ref={taskDescriptionRef}
                            name="taskDescription"
                            placeholder="Task Description"
                            value={localTask.taskDescription}
                            onChange={(e) => {
                                setLocalTask((prev) => ({
                                    ...prev,
                                    taskDescription: e.target.value,
                                }));
                                updateCardSize(); // Call updateCardSize on each change
                            }}
                            onFocus={() => setIsFocusedCallback(true)}
                            onBlur={handleInputBlur}
                            className="textarea textarea-bordered w-full p-4 pt-2 pb-2 resize-none flex-grow"
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                minHeight: '100px',
                                maxHeight: `500px`, // Subtract space for name input and toolbar
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

export default React.memo(TaskCard);
