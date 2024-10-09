// src/components/TaskCard.tsx
'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { updateTask, moveTaskToSpace } from '../../store/tasksSlice';
import { setSubtaskDrawerOpen } from '@/store/uiSlice';
import { updateSpaceTaskOrderAsync } from '@/store/spaceSlice';
import Draggable from 'react-draggable';
import debounce from 'lodash.debounce';
import { motion } from 'framer-motion';

import { useAddNewSubtask } from '@/hooks/useAddNewSubtask';
import { useAlert } from '@/hooks/useAlert';
import { useArchiveTask } from '@/hooks/useArchiveTask';
import { useChangeHierarchy } from '@/hooks/useChangeHierarchy';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import { useDragHandlers } from '@/hooks/useDragHandlers';
import { useDuplicateTask } from '@/hooks/useDuplicateTask';
import { useFadeOutEffect } from '@/hooks/useFadeOutEffect';
import { useResizeHandle } from '@/hooks/useResizeHandle';
import { useTaskState } from '@/hooks/useTaskState';
import { useTheme } from '@/hooks/useTheme';
import { useThrottle } from '@/hooks/useThrottle';

import DraggableArea from './DraggableArea';
import TaskCardBottomBar from './TaskCardBottomBar';
import TaskCardTopBar from './TaskCardTopBar';
import { TaskDetails } from '../TaskDetails';

import { Task, TaskProgress } from '@/types';
import ConfirmDelete from './ConfirmDelete';

interface TaskCardProps {
    task: Task;
    onDragStart: () => void;
    onDragStop: () => void;
    getNewZIndex: () => number;
}

const TaskCard = React.memo(
    ({
        task: initialTask,
        onDragStart,
        onDragStop,
        getNewZIndex,
    }: TaskCardProps) => {
        const dispatch = useDispatch<AppDispatch>();
        const currentTheme = useTheme();

        const [isMenuOpen, setIsMenuOpen] = useState(false);

        const isGlobalDragging = useSelector(
            (state: RootState) => state.ui.isGlobalDragging
        );
        const draggingCardId = useSelector(
            (state: RootState) => state.ui.draggingCardId
        );
        const tasksState = useSelector((state: RootState) => state.tasks.tasks);
        const spacesState = useSelector(
            (state: RootState) => state.spaces.spaces
        );

        // Use a selector to get the latest task data from the Redux store
        const task = useSelector((state: RootState) => {
            const foundTask = state.tasks.tasks.find(
                (t) => t._id === initialTask._id
            );
            return foundTask
                ? {
                      ...foundTask,
                      x: foundTask.x,
                      y: foundTask.y,
                      zIndex: foundTask.zIndex,
                  }
                : initialTask;
        });

        if (!task) {
            console.error('Task not found in the store:', initialTask._id);
            return null; // or some fallback UI
        }

        const { duplicateTask } = useDuplicateTask();
        const { convertTaskToSubtask } = useChangeHierarchy();
        const {
            initiateDeleteTask,
            showDeleteConfirm,
            taskToDelete,
            cancelDelete,
        } = useDeleteTask();
        const { addNewSubtask } = useAddNewSubtask();
        const { showAlert } = useAlert();
        const archiveTask = useArchiveTask({ tasksState, spacesState });

        const {
            localTask,
            isHovering,
            isFocused,
            cardSize,
            isDraggingOverRef,
            isHoveringRef,
            isDraggingOver,
            setIsDraggingOver,
            setLocalTask,
            setIsHovering,
            setIsFocused,
            setCardSize,
            setIsDropped,
            showDetails,
            setShowDetails,
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
            async (updatedFields: Partial<Task>) => {
                if (task._id) {
                    await dispatch(
                        updateTask({ _id: task._id, ...updatedFields })
                    );
                }
            },
            [dispatch, task._id]
        );

        const debouncedUpdate = useMemo(
            () => debounce(updateTaskInStore, 1000),
            [updateTaskInStore]
        );

        const pushChildTask = useCallback(
            async (childTask: Task, parentTaskId: string) => {
                convertTaskToSubtask(childTask, parentTaskId);
            },
            [convertTaskToSubtask]
        );

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

        const { handleDragStart, handleDragStop } = useDragHandlers({
            isDragging,
            setIsDragging,
            task,
            localTask,
            setLocalTask,
            onDragStart,
            onDragStop,
            getNewZIndex,
            pushChildTask,
            debouncedUpdate,
            setIsFocused,
            allowDropRef,
            setAllowDrop,
            allowDrop,
        });

        const handleInputChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const { name, value } = e.target;
                setLocalTask(
                    (prev: Task): Task => ({
                        ...prev,
                        [name]: value,
                    })
                );
            },
            [setLocalTask]
        );

        const handleInputBlur = useCallback(
            (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                setIsFocused(false);
                const fieldName = e.target.name;
                const fieldValue = e.target.value;

                setLocalTask((prevTask) => {
                    const newTaskData = { [fieldName]: fieldValue };
                    // Do not use debouncedUpdate here.
                    // This is because we do not want the update to be interrupted
                    updateTaskInStore(newTaskData);
                    return { ...prevTask, ...newTaskData };
                });
            },
            [setLocalTask, updateTaskInStore]
        );

        const handleGlobalMouseMove = useCallback(
            (e: MouseEvent) => {
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
                    const isDraggingOver =
                        cardsUnderCursor.length > 0 &&
                        cardsUnderCursor[1] === cardRef.current;
                    if (isDraggingOver !== isDraggingOverRef.current) {
                        isDraggingOverRef.current = isDraggingOver;
                        setIsDraggingOver(isDraggingOver);
                    }
                }
            },
            [isGlobalDragging, draggingCardId, task._id]
        );

        const handleGlobalMouseUp = useCallback(() => {
            if (isDraggingOverRef.current) {
                setIsDropped(true);
                setTimeout(() => setIsDropped(false), 400);
            }
            isDraggingOverRef.current = false;
            setIsDraggingOver(false);
        }, []);

        useEffect(() => {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);

            return () => {
                document.removeEventListener(
                    'mousemove',
                    handleGlobalMouseMove
                );
                document.removeEventListener('mouseup', handleGlobalMouseUp);
            };
        }, [handleGlobalMouseMove, handleGlobalMouseUp]);

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
            debouncedUpdate({ dueDate: date || null });
        };

        const handleMoveTask = (spaceId: string) => {
            const space = spacesState.find((space) => space._id === spaceId);
            if (!space) return;

            dispatch(moveTaskToSpace({ taskId: task._id!, spaceId }));
            dispatch(
                updateSpaceTaskOrderAsync({
                    spaceId,
                    taskOrder: [...space.taskOrder, task._id!],
                })
            ).then(() => {
                showAlert('Task moved successfully', 'notice');
            });
        };

        const handleDuplicateTask = async () => {
            const space = spacesState.find((space) => space._id === task.space);
            const duplicateResult = await duplicateTask(task, tasksState);
            const newTask = duplicateResult[0];
            if (space) {
                dispatch(
                    updateSpaceTaskOrderAsync({
                        spaceId: space._id!,
                        taskOrder: [...space.taskOrder, newTask._id!],
                    })
                );
            }
        };

        const handleShowDetails = () => {
            setShowDetails(true);
        };

        const handleSetEmoji = (emoji: string) => {
            setLocalTask((prevTask) => ({ ...prevTask, emoji }));
        };

        const handleAddSubtask = () => {
            addNewSubtask({
                subtask: {
                    taskName: 'New Subtask',
                    taskDescription: '',
                    x: localTask.x + 20,
                    y: localTask.y + 20,
                    width: 100,
                    height: 100,
                    subtasks: [],
                    zIndex: 0,
                    progress: 'Not Started',
                    space: localTask.space || '',
                },
                parentId: localTask._id,
                position: 'start',
            });
        };

        const handleArchiveTask = useCallback(() => {
            archiveTask(task);
            dispatch(setSubtaskDrawerOpen(false));
        }, [archiveTask, task, dispatch]);

        const handleContextMenu = useCallback((e: React.MouseEvent) => {
            e.preventDefault();
            setIsMenuOpen(true);
        }, []);

        const baseCardStyle: React.CSSProperties = useMemo(
            () => ({
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
                border: '2px solid',
            }),
            [
                localTask.zIndex,
                task.width,
                task.height,
                cardSize.width,
                cardSize.height,
            ]
        );

        const cardClassName = useMemo(() => {
            return `task-card shadow-lg shadow-black/20 cursor-move flex flex-col space-y-2 rounded-xl transition-all duration-200 relative ${
                isDraggingOver ? 'filter brightness-110' : ''
            } ${isResizing ? 'select-none' : ''}`;
        }, [isDraggingOver, isResizing]);

        const cardStyle = useMemo(
            () => ({
                ...baseCardStyle,
                backgroundColor: `var(--${currentTheme}-background-100)`,
                color: `var(--${currentTheme}-text-default)`,
                borderColor: isDraggingOver
                    ? `var(--${currentTheme}-accent-blue)`
                    : `var(--${currentTheme}-card-border-color)`,
            }),
            [isDraggingOver, currentTheme, baseCardStyle]
        );

        useEffect(() => {
            setLocalTask((prevTask) => ({ ...prevTask, zIndex: task.zIndex }));
        }, [task.zIndex]);

        const shouldDelete = useFadeOutEffect(
            task,
            isHovering,
            isFocused,
            initiateDeleteTask
        );

        const handleMouseEnter = useCallback(() => {
            isHoveringRef.current = true;
            if (isHoveringRef.current !== isHovering) {
                setIsHovering(true);
            }
        }, []);

        const handleMouseLeave = useCallback(() => {
            isHoveringRef.current = false;
            setIsHovering(false);
        }, []);

        return (
            <Draggable
                position={{ x: task.x, y: task.y }}
                bounds="parent"
                handle=".draggable-area"
                onStart={(e, data) => {
                    handleDragStart(e, data);
                }}
                onStop={(e, data) => {
                    handleDragStop(e, data);
                }}
            >
                <motion.div
                    ref={cardRef}
                    className={cardClassName}
                    style={cardStyle}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: shouldDelete ? 0 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onContextMenu={handleContextMenu}
                    data-task-id={task._id}
                >
                    <div className="flex flex-col h-full">
                        <DraggableArea className="flex flex-col h-full p-4 pt-2 pb-0">
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
                                    initiateDeleteTask(task._id ?? '')
                                }
                                onDetails={handleShowDetails}
                                onSetDueDate={handleSetDueDate}
                                onSetEmoji={handleSetEmoji}
                                onAddSubtask={handleAddSubtask}
                                onMoveTask={handleMoveTask}
                                onDuplicateTask={handleDuplicateTask}
                                setIsMenuOpen={setIsMenuOpen}
                                isMenuOpen={isMenuOpen}
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
                                style={{
                                    backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
                                    color: `var(--${currentTheme}-text-default)`, // Use theme color
                                }}
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
                                    backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
                                    color: `var(--${currentTheme}-text-default)`, // Use theme color
                                }}
                                maxLength={500}
                            />
                            <TaskCardBottomBar
                                task={task}
                                progress={localTask.progress}
                                onProgressChange={handleProgressChange}
                                handleResizeStart={handleResizeStart}
                                currentTheme={currentTheme}
                                onArchive={handleArchiveTask}
                            />
                        </DraggableArea>
                    </div>
                    {showDeleteConfirm && taskToDelete && (
                        <ConfirmDelete
                            objectToDelete={taskToDelete}
                            cancelDelete={cancelDelete}
                            spaceOrTask={'task'}
                        />
                    )}
                </motion.div>
            </Draggable>
        );
    }
);

export default React.memo(TaskCard);
