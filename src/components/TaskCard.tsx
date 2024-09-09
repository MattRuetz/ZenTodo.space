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
    hideNewChildTask,
    addChildTask,
} from '../store/tasksSlice';
import { AppDispatch, RootState } from '../store/store';
import TaskCardToolBar from './TaskCardToolBar';
import { Task, TaskProgress } from '@/types';
import DraggableArea from './DraggableArea';
import { setGlobalDragging, setDraggingCardId } from '../store/uiSlice';
import { useThrottle } from '@/hooks/useThrottle';
import { useFadeOutEffect } from '@/hooks/useFadeOutEffect';

interface TaskCardProps {
    task: Task;
    onDragStart: () => void;
    onDragStop: () => void;
    getNewZIndex: () => number;
    subtasks: Task[];
}

const TaskCard: React.FC<TaskCardProps> = ({
    task,
    onDragStart,
    onDragStop,
    getNewZIndex,
    subtasks,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isGlobalDragging, draggingCardId } = useSelector(
        (state: RootState) => state.ui
    );
    const [localTask, setLocalTask] = useState(task);
    const [isHovering, setIsHovering] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [deletingTasks, setDeletingTasks] = useState<Set<string>>(new Set());
    const [cardSize, setCardSize] = useState({ width: 240, height: 200 });
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isDropped, setIsDropped] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);
    const resizingRef = useRef(false);
    const startPosRef = useRef({ x: 0, y: 0 });
    const startSizeRef = useRef({ width: 0, height: 0 });
    const taskNameRef = useRef<HTMLInputElement>(null);
    const taskDescriptionRef = useRef<HTMLTextAreaElement>(null);

    const updateTaskInStore = useCallback(
        (updatedFields: Partial<Task>) => {
            if (task._id) {
                dispatch(updateTask({ _id: task._id, ...updatedFields }));
            }
        },
        [dispatch, task._id]
    );

    const debouncedUpdate = useCallback(debounce(updateTaskInStore, 500), [
        updateTaskInStore,
    ]);

    const pushChildTask = useCallback(
        async (childTask: Task, parentTaskId: string) => {
            // Assume task is already in the database
            await dispatch(addChildTask({ childTask, parentTaskId }));
            dispatch(hideNewChildTask(childTask._id ?? ''));
        },
        [dispatch]
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

            const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
            const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
            const elementsUnderCursor = document.elementsFromPoint(
                clientX,
                clientY
            );
            const cardsUnderCursor = elementsUnderCursor.filter((el) =>
                el.classList.contains('task-card')
            );
            const droppedOnCard = cardsUnderCursor[1];
            if (droppedOnCard && droppedOnCard !== e.target) {
                console.log('Dropped card ID:', task._id);
                console.log(
                    'Target card ID:',
                    droppedOnCard.getAttribute('data-task-id')
                );
                pushChildTask(
                    task,
                    droppedOnCard.getAttribute('data-task-id') ?? ''
                );
            }
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
                setIsDraggingOver(
                    cardsUnderCursor.length > 0 &&
                        cardsUnderCursor[1] === cardRef.current
                );
            }
        };

        const handleGlobalMouseUp = () => {
            if (isDraggingOver) {
                setIsDropped(true);
                // Something that happens when you drop a card
                setTimeout(() => setIsDropped(false), 500);
            }
            setIsDraggingOver(false);
        };

        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isGlobalDragging, draggingCardId, task._id, isDraggingOver]);

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
            setIsFocused(false);
            const fieldName = e.target.name;
            const fieldValue = e.target.value;
            console.log('BLUR: fieldValue', fieldValue);

            const updatedFields = { [fieldName]: fieldValue };
            setLocalTask((prevTask) => {
                const newTask = { ...prevTask, ...updatedFields };
                debouncedUpdate(newTask);
                return newTask;
            });
            updateCardSize();
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
        [deletingTasks, dispatch, localTask._id]
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

    const opacity = useFadeOutEffect(
        localTask,
        isHovering,
        isFocused,
        handleDelete
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
            overflow: 'visible',
            minWidth: '250px',
            maxWidth: '500px',
            minHeight: '230px',
            maxHeight: '500px',
        }),
        [opacity, localTask.zIndex, cardSize.width, cardSize.height]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setLocalTask((prev) => ({ ...prev, [name]: value }));
            if (name === 'taskDescription') updateCardSize();
        },
        [updateCardSize]
    );

    const getSubtaskProgresses = (subtasks: Task[]) => {
        return subtasks.reduce(
            (acc, subtask) => {
                switch (subtask.progress) {
                    case 'Not Started':
                        acc.notStarted++;
                        break;
                    case 'In Progress':
                        acc.inProgress++;
                        break;
                    case 'Blocked':
                        acc.blocked++;
                        break;
                    case 'Complete':
                        acc.complete++;
                        break;
                }
                return acc;
            },
            {
                notStarted: 0,
                inProgress: 0,
                blocked: 0,
                complete: 0,
            }
        );
    };

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
                        ? 'border-blue-500'
                        : isDropped
                        ? 'border-green-500'
                        : 'border-base-300'
                }`}
                style={cardStyle}
                onClick={handleCardClick}
                onMouseDown={handleMouseDown}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                data-task-id={task._id}
            >
                <div className="flex flex-col h-full">
                    <DraggableArea
                        className="flex flex-col h-full p-4"
                        onDelete={() => handleDelete(task._id ?? '')}
                    >
                        <input
                            ref={taskNameRef}
                            type="text"
                            name="taskName"
                            placeholder="Task Name"
                            value={localTask.taskName}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={handleInputBlur}
                            className="input input-bordered w-full p-4 pt-2 pb-2 h-8 mb-2 resize-none"
                            maxLength={35}
                        />
                        <textarea
                            ref={taskDescriptionRef}
                            name="taskDescription"
                            placeholder="Task Description"
                            value={localTask.taskDescription}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={handleInputBlur}
                            className="textarea textarea-bordered w-full p-4 pt-2 pb-2 resize-none flex-grow"
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                minHeight: '100px',
                                maxHeight: '500px',
                                overflowY: 'auto',
                            }}
                            maxLength={500}
                        />
                        <TaskCardToolBar
                            progress={localTask.progress}
                            onProgressChange={handleProgressChange}
                            subtaskProgresses={getSubtaskProgresses(subtasks)}
                        />
                    </DraggableArea>
                </div>
            </div>
        </Draggable>
    );
};

export default React.memo(TaskCard);
