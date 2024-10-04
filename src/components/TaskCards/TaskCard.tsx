// src/components/TaskCard.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Draggable from 'react-draggable';
import debounce from 'lodash.debounce';
import { updateTask, moveTaskToSpace } from '../../store/tasksSlice';
import { AppDispatch, RootState } from '../../store/store';
import { Task, TaskProgress } from '@/types';
import DraggableArea from './DraggableArea';
import { useThrottle } from '@/hooks/useThrottle';
import { useDragHandlers } from '@/hooks/useDragHandlers';
import { useTaskState } from '@/hooks/useTaskState';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import { useResizeHandle } from '@/hooks/useResizeHandle';
import TaskCardTopBar from './TaskCardTopBar';
import { TaskDetails } from '../TaskDetails';
import { useAddNewSubtask } from '@/hooks/useAddNewSubtask';
import TaskCardBottomBar from './TaskCardBottomBar';
import { useDuplicateTask } from '@/hooks/useDuplicateTask';
import { useChangeHierarchy } from '@/hooks/useChangeHierarchy';
import ConfirmDelete from './ConfirmDelete';
import { useAlert } from '@/hooks/useAlert';
import { useTheme } from '@/hooks/useTheme';
import { useFadeOutEffect } from '@/hooks/useFadeOutEffect';
import { useArchiveTask } from '@/hooks/useArchiveTask';
import { motion } from 'framer-motion';
import { ComponentSpinner } from '../ComponentSpinner';
import { setSubtaskDrawerOpen } from '@/store/uiSlice';
import { updateSpaceTaskOrderAsync } from '@/store/spaceSlice';

interface TaskCardProps {
    task: Task;
    onDragStart: () => void;
    onDragStop: () => void;
    getNewZIndex: () => number;
}

const TaskCard = React.memo(
    ({ task, onDragStart, onDragStop, getNewZIndex }: TaskCardProps) => {
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

        const { duplicateTask } = useDuplicateTask();
        const { convertTaskToSubtask } = useChangeHierarchy();

        const {
            initiateDeleteTask,
            cancelDelete,
            showDeleteConfirm,
            taskToDelete,
        } = useDeleteTask();
        const { addNewSubtask } = useAddNewSubtask();
        const { showAlert } = useAlert();
        const archiveTask = useArchiveTask();

        const {
            localTask,
            isHovering,
            isFocused,
            cardSize,
            isDraggingOverRef,
            isHoveringRef,
            isDraggingOver,
            setIsDraggingOver,
            isDropped,
            setLocalTask,
            setIsHovering,
            setIsFocused,
            setCardSize,
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
            isLoading,
            setIsLoading,
        } = useTaskState(task);

        const updateTaskInStore = useCallback(
            async (updatedFields: Partial<Task>) => {
                if (task._id) {
                    // setTimeout(() => {
                    //     setIsLoading(true);
                    // }, 1000);
                    await dispatch(
                        updateTask({ _id: task._id, ...updatedFields })
                    );
                    // setIsLoading(false);
                }
            },
            [dispatch, task._id]
        );

        const debouncedUpdate = useCallback(debounce(updateTaskInStore, 500), [
            updateTaskInStore,
        ]);

        const pushChildTask = useCallback(
            async (childTask: Task, parentTaskId: string) => {
                convertTaskToSubtask(childTask, parentTaskId);
            },
            [convertTaskToSubtask]
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

        const eventListeners = useMemo(
            () => ({
                handleGlobalMouseMove,
                handleGlobalMouseUp,
            }),
            [handleGlobalMouseMove, handleGlobalMouseUp]
        );

        useEffect(() => {
            document.addEventListener(
                'mousemove',
                eventListeners.handleGlobalMouseMove
            );
            document.addEventListener(
                'mouseup',
                eventListeners.handleGlobalMouseUp
            );

            return () => {
                document.removeEventListener(
                    'mousemove',
                    eventListeners.handleGlobalMouseMove
                );
                document.removeEventListener(
                    'mouseup',
                    eventListeners.handleGlobalMouseUp
                );
            };
        }, [eventListeners]);

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

        const handleDuplicateTask = () => {
            const space = spacesState.find((space) => space._id === task.space);
            duplicateTask(task, tasksState);
            if (space) {
                dispatch(
                    updateSpaceTaskOrderAsync({
                        spaceId: space._id!,
                        taskOrder: [...space.taskOrder, task._id!],
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

        // Right click card opens the menu
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
            return `task-card absolute shadow-md cursor-move flex flex-col space-y-2 rounded-xl transition-all duration-200 ${
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
                <motion.div
                    ref={cardRef}
                    className={cardClassName}
                    style={cardStyle}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: shouldDelete ? 0 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onContextMenu={handleContextMenu}
                    data-task-id={task._id}
                >
                    <>
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
                    </>
                    {showDeleteConfirm && taskToDelete && (
                        <ConfirmDelete
                            objectToDelete={taskToDelete}
                            cancelDelete={cancelDelete}
                            spaceOrTask={'task'}
                        />
                    )}
                    {isLoading && <ComponentSpinner />}
                </motion.div>
            </Draggable>
        );
    }
);

export default React.memo(TaskCard);
