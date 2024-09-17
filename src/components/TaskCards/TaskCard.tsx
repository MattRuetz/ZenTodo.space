// src/components/TaskCard.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Draggable from 'react-draggable';
import debounce from 'lodash.debounce';
import {
    updateTask,
    hideNewChildTask,
    convertTaskToSubtask,
    moveTaskToSpace,
    addNewSubtask,
} from '../../store/tasksSlice';
import {
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
} from '../../store/uiSlice';
import { AppDispatch, RootState } from '../../store/store';
import TaskCardToolBar from './TaskCardBottomBar';
import { Task, TaskProgress } from '@/types';
import DraggableArea from './DraggableArea';
import { useThrottle } from '@/hooks/useThrottle';
import { useFadeOutEffect } from '@/hooks/useFadeOutEffect';
import { useDragHandlers } from '@/hooks/useDragHandlers';
import { useTaskState } from '@/hooks/useTaskState';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import { useResizeHandle } from '@/hooks/useResizeHandle';
import { toast } from 'react-toastify';
import TaskCardTopBar from './TaskCardTopBar';
import { FaX } from 'react-icons/fa6';
import { FaInfoCircle } from 'react-icons/fa';
import { useDateString, useDateTimeString } from '@/hooks/useDateString';
import { TaskDetails } from '../TaskDetails';
import { useAddSubtask } from '@/hooks/useAddSubtask';
import TaskCardBottomBar from './TaskCardBottomBar';
import { useDuplicateTask } from '@/hooks/useDuplicateTask';

interface TaskCardProps {
    task: Task;
    onDragStart: () => void;
    onDragStop: () => void;
    getNewZIndex: () => number;
}

const TaskCard = React.memo(
    ({ task, onDragStart, onDragStop, getNewZIndex }: TaskCardProps) => {
        const dispatch = useDispatch<AppDispatch>();

        const isGlobalDragging = useSelector(
            (state: RootState) => state.ui.isGlobalDragging
        );
        const draggingCardId = useSelector(
            (state: RootState) => state.ui.draggingCardId
        );

        const { duplicateTask } = useDuplicateTask();

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
            showDetails,
            setShowDetails,
            deletingTasks,
            setDeletingTasks,
            cardRef,
            taskNameRef,
            taskDescriptionRef,
            resizingRef,
            startPosRef,
            startSizeRef,
            isDragging,
            setIsDragging,
            allowDropRef,
            setAllowDrop,
            allowDrop,
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
                dispatch(convertTaskToSubtask({ childTask, parentTaskId }));
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
                    if (prev.width < newWidth || prev.height < newHeight) {
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

        const handleProgressChange = useCallback(
            (newProgress: TaskProgress) => {
                setLocalTask((prevTask) => {
                    const newTaskData = { progress: newProgress };
                    debouncedUpdate(newTaskData);
                    return { ...prevTask, ...newTaskData };
                });
            },
            [debouncedUpdate, setLocalTask]
        );

        const {
            handleDragStart,
            handleDragStop,
            handleInputChange,
            handleInputBlur,
            handleMouseDown,
        } = useDragHandlers({
            isDragging,
            setIsDragging,
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
            setIsFocused,
            cardRef,
            resizingRef,
            startPosRef,
            startSizeRef,
            allowDropRef,
            setAllowDrop,
            allowDrop,
        });

        const { handleAddSubtask } = useAddSubtask({ task, position: 'start' });

        const { handleDelete } = useDeleteTask({
            deletingTasks,
            setDeletingTasks,
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
                    setTimeout(() => setIsDropped(false), 400);
                }
                setIsDraggingOver(false);
            };

            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);

            return () => {
                document.removeEventListener(
                    'mousemove',
                    handleGlobalMouseMove
                );
                document.removeEventListener('mouseup', handleGlobalMouseUp);
            };
        }, [isGlobalDragging, draggingCardId, task._id, isDraggingOver]);

        const opacity = useFadeOutEffect(
            localTask,
            isHovering,
            isFocused,
            handleDelete
        );

        // Force re-render every animation frame
        const [, forceUpdate] = useState({});
        useEffect(() => {
            const animate = () => {
                forceUpdate({});
                requestAnimationFrame(animate);
            };
            const animationId = requestAnimationFrame(animate);
            return () => cancelAnimationFrame(animationId);
        }, [opacity]);

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
                    throttledSetCardSize({
                        width: newWidth,
                        height: newHeight,
                    });
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

        const { handleResizeStart, isResizing } = useResizeHandle({
            cardRef,
            setCardSize,
            minWidth: 250,
            maxWidth: 500,
            minHeight: 230,
            maxHeight: 500,
            taskId: task._id ?? '',
        });

        const handleSetDueDate = (date: Date | undefined) => {
            setLocalTask((prevTask) => ({ ...prevTask, dueDate: date }));
            debouncedUpdate({ dueDate: date });
        };

        const handleMoveTask = (spaceId: string) => {
            dispatch(moveTaskToSpace({ taskId: task._id!, spaceId }));
            toast.success('Task moved successfully');
        };

        const handleCreateSpaceAndMoveTask = () => {
            // Implement logic to create a new space and move the task
        };

        const handleDuplicateTask = () => {
            duplicateTask(task);
            // toast.success('Task duplicated successfully');
        };

        const handleShowDetails = () => {
            setShowDetails(true);
        };

        const handleSetEmoji = (emoji: string) => {
            setLocalTask((prevTask) => ({ ...prevTask, emoji }));
        };

        const cardStyle: React.CSSProperties = useMemo(
            () => ({
                opacity,
                zIndex: localTask.zIndex,
                width: `${task.width || cardSize.width}px`,
                height: `${task.height || cardSize.height}px`,
                position: 'absolute',
                transition: 'border-color 0.3s ease',
                minWidth: '270px',
                maxWidth: '500px',
                minHeight: '250px',
                maxHeight: '500px',
                overflow: 'visible',
            }),
            [
                opacity,
                localTask.zIndex,
                task.width,
                task.height,
                cardSize.width,
                cardSize.height,
            ]
        );

        useEffect(() => {
            setLocalTask((prevTask) => ({ ...prevTask, zIndex: task.zIndex }));
        }, [task.zIndex]);

        return (
            <Draggable
                defaultPosition={{ x: task.x, y: task.y }}
                bounds="parent"
                handle=".draggable-area"
                onStart={(e, data) => {
                    handleDragStart(e, data);
                }}
                onStop={(e, data) => {
                    handleDragStop(e, data);
                }}
            >
                <div
                    ref={cardRef}
                    className={`task-card absolute bg-base-300 shadow cursor-move flex flex-col space-y-2 rounded-xl transition-all duration-200 border-2  ${
                        isDraggingOver
                            ? 'filter brightness-110 border-blue-900'
                            : isDropped && allowDrop
                            ? 'filter brightness-150 border-green-500'
                            : 'border-base-300'
                    } ${isResizing ? 'select-none' : ''}`}
                    style={cardStyle}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    data-task-id={task._id}
                >
                    <>
                        <div className="flex flex-col h-full">
                            <DraggableArea
                                className="flex flex-col h-full p-4 pt-2 pb-0"
                                onDelete={() => handleDelete(task._id ?? '')}
                                onDetails={handleShowDetails}
                                onSetDueDate={handleSetDueDate}
                                onMoveTask={handleMoveTask}
                                onCreateSpaceAndMoveTask={
                                    handleCreateSpaceAndMoveTask
                                }
                                onDuplicateTask={handleDuplicateTask}
                                onAddSubtask={handleAddSubtask}
                                task={task}
                            >
                                {showDetails && (
                                    <TaskDetails
                                        task={task}
                                        setShowDetails={setShowDetails}
                                    />
                                )}
                                <TaskCardTopBar
                                    className="pb-2"
                                    task={task}
                                    onDelete={() =>
                                        handleDelete(task._id ?? '')
                                    }
                                    onDetails={handleShowDetails}
                                    onSetDueDate={handleSetDueDate}
                                    onSetEmoji={handleSetEmoji}
                                    onAddSubtask={handleAddSubtask}
                                    onMoveTask={handleMoveTask}
                                    onCreateSpaceAndMoveTask={
                                        handleCreateSpaceAndMoveTask
                                    }
                                    onDuplicateTask={handleDuplicateTask}
                                />
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
                                    maxLength={30}
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
                                <TaskCardBottomBar
                                    task={task}
                                    progress={localTask.progress}
                                    onProgressChange={handleProgressChange}
                                    handleResizeStart={handleResizeStart}
                                    isResizing={isResizing}
                                />
                            </DraggableArea>
                        </div>
                    </>
                </div>
            </Draggable>
        );
    }
);
export default React.memo(TaskCard);
