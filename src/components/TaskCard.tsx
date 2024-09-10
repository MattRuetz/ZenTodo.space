// src/components/TaskCard.tsx
'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Draggable from 'react-draggable';
import debounce from 'lodash.debounce';
import {
    updateTask,
    hideNewChildTask,
    addChildTask,
} from '../store/tasksSlice';
import { AppDispatch, RootState } from '../store/store';
import TaskCardToolBar from './TaskCardToolBar';
import { Task } from '@/types';
import DraggableArea from './DraggableArea';
import { useThrottle } from '@/hooks/useThrottle';
import { useFadeOutEffect } from '@/hooks/useFadeOutEffect';
import { useDragHandlers } from '@/hooks/useDragHandlers';
import { useTaskState } from '@/hooks/useTaskState';

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

    const {
        localTask,
        isHovering,
        isFocused,
        cardSize,
        isDraggingOver,
        isDropped,
        setLocalTask,
        setIsHovering,
        setIsFocused,
        setCardSize,
        setIsDraggingOver,
        setIsDropped,
        cardRef,
        taskNameRef,
        taskDescriptionRef,
        resizingRef,
        startPosRef,
        startSizeRef,
        deletingTasks,
        setDeletingTasks,
    } = useTaskState(task);

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
            dispatch(addChildTask({ childTask, parentTaskId }));
            dispatch(hideNewChildTask(childTask._id ?? ''));
        },
        [dispatch]
    );

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

    const {
        handleDragStart,
        handleDragStop,
        handleInputChange,
        handleInputBlur,
        handleProgressChange,
        handleDelete,
        handleMouseDown,
    } = useDragHandlers({
        task,
        localTask,
        setLocalTask,
        setCardSize,
        onDragStart,
        onDragStop,
        getNewZIndex,
        pushChildTask,
        debouncedUpdate,
        updateCardSize,
        updateTaskInStore,
        deletingTasks,
        setDeletingTasks,
        setIsFocused,
        cardRef,
        resizingRef,
        startPosRef,
        startSizeRef,
    });

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

    useEffect(() => {
        updateCardSize();
    }, [localTask.taskName, localTask.taskDescription, updateCardSize]);

    const opacity = useFadeOutEffect(
        localTask,
        isHovering,
        isFocused,
        handleDelete
    );

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

    const getSubtaskProgresses = useCallback(
        (subtasks: Task[]) => {
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
        },
        [subtasks]
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
                        ? 'border-blue-500'
                        : isDropped
                        ? 'border-green-500'
                        : 'border-base-300'
                }`}
                style={cardStyle}
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
                            taskId={task._id ?? ''}
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
