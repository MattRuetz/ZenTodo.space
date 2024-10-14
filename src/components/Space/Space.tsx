// src/components/Space.tsx
'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateMultipleTasks, updateTask } from '../../store/tasksSlice';
import {
    updateSpaceMaxZIndex,
    fetchSpaceMaxZIndex,
} from '../../store/spaceSlice';
import { setSubtaskDrawerOpen } from '@/store/uiSlice';
import { createSelector } from '@reduxjs/toolkit';
import { useDrop } from 'react-dnd';
import { AnimatePresence, motion } from 'framer-motion';
import debounce from 'lodash.debounce';

import { useAddTask } from '@/hooks/useAddTask';
import { useClearFilters } from '@/hooks/useClearFilters';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { useTheme } from '@/hooks/useTheme';

import ControlPanel from '../ControlPanel/ControlPanel';
import SubtaskDrawer from '../Subtask/SubtaskDrawer';
import TaskCard from '../TaskCards/TaskCard';
import TaskListView from '../Mobile/TaskListView';

import { TaskProgress, Task } from '@/types';

import { selectTasksForSpace } from '@/store/selectors';

// Memoized selectors
export const selectSelectedEmojis = createSelector(
    (state: RootState) => state.spaces.currentSpace,
    (currentSpace) => currentSpace?.selectedEmojis || []
);

export const selectSelectedProgresses = createSelector(
    (state: RootState) => state.spaces.currentSpace,
    (currentSpace) => currentSpace?.selectedProgresses || []
);

export const selectSelectedDueDateRange = createSelector(
    (state: RootState) => state.spaces.currentSpace,
    (currentSpace) => currentSpace?.selectedDueDateRange || null
);

const selectIsSubtaskDrawerOpen = (state: RootState) =>
    state.ui.isSubtaskDrawerOpen;

const Space: React.FC<{ spaceId: string }> = React.memo(({ spaceId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTheme = useTheme();

    const isMobileSize = useIsMobileSize();

    const tasks = useSelector(selectTasksForSpace);

    const selectedEmojis = useSelector(selectSelectedEmojis);
    const selectedProgresses = useSelector(selectSelectedProgresses);
    const selectedDueDateRange = useSelector(selectSelectedDueDateRange);
    const currentSpace = useSelector(
        (state: RootState) => state.spaces.currentSpace
    );
    const wallpaper = useSelector(
        (state: RootState) => state.spaces.currentSpace?.wallpaper
    );
    const customBackgroundColor = useSelector(
        (state: RootState) => state.spaces.currentSpace?.backgroundColor
    );
    const isSubtaskDrawerOpen = useSelector(selectIsSubtaskDrawerOpen);
    const spaceOutlineColor = useSelector(
        (state: RootState) => state.spaces.currentSpace?.color
    );

    const { clearFilters } = useClearFilters(spaceId);
    const { addTask } = useAddTask();

    const [maxZIndex, setMaxZIndex] = useState(currentSpace?.maxZIndex || 1);
    const [canCreateTask, setCanCreateTask] = useState(true);

    const isDraggingRef = useRef(false);
    const subtaskDrawerRef = useRef<HTMLDivElement>(null);
    const spaceRef = useRef<HTMLDivElement>(null);

    const COOLDOWN_TIME = 500; // ms

    const normalizeZIndexValues = useCallback(() => {
        const sortedTasks = [...tasks].sort((a, b) => a.zIndex - b.zIndex);
        const updatedTasks = sortedTasks.map((task, index) => ({
            ...task,
            zIndex: index + 1,
        }));

        updatedTasks.forEach((task) => {
            dispatch(
                updateTask({
                    _id: task._id as string,
                    zIndex: task.zIndex as number,
                })
            );
        });

        const newMaxZIndex = updatedTasks.length;
        setMaxZIndex(newMaxZIndex);
        dispatch(updateSpaceMaxZIndex({ spaceId, maxZIndex: newMaxZIndex }));
    }, [tasks, spaceId, dispatch]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            normalizeZIndexValues();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [normalizeZIndexValues]);

    const getNewZIndex = useCallback(() => {
        const newZIndex = maxZIndex + 1;
        setMaxZIndex(newZIndex);
        dispatch(updateSpaceMaxZIndex({ spaceId, maxZIndex: newZIndex }));
        return newZIndex;
    }, [maxZIndex, spaceId, dispatch]);

    useEffect(() => {
        dispatch(fetchSpaceMaxZIndex(spaceId));
    }, [spaceId, dispatch]);

    const handleCloseDrawer = () => dispatch(setSubtaskDrawerOpen(false));

    const [, drop] = useDrop(
        () => ({
            accept: 'SUBTASK',
            drop: (item: Task, monitor) => {
                const offset = monitor.getClientOffset();
                if (!offset) return undefined;

                if (subtaskDrawerRef.current) {
                    const drawerRect =
                        subtaskDrawerRef.current.getBoundingClientRect();
                    if (
                        offset.x >= drawerRect.left &&
                        offset.x <= drawerRect.right &&
                        offset.y >= drawerRect.top &&
                        offset.y <= drawerRect.bottom
                    ) {
                        return undefined; // Drop on drawer, don't convert to task
                    }
                }

                const spaceRect = spaceRef.current?.getBoundingClientRect();
                if (spaceRect) {
                    const { x: safeX, y: safeY } = calculateSafePosition(
                        offset.x - spaceRect.left,
                        offset.y - spaceRect.top
                    );
                    return { x: safeX, y: safeY };
                }

                return undefined;
            },
        }),
        []
    );

    const calculateSafePosition = (
        x: number,
        y: number,
        taskWidth = 270,
        taskHeight = 250
    ) => {
        const spaceRect = spaceRef.current?.getBoundingClientRect();
        if (!spaceRect) return { x, y };

        const safeX = Math.min(Math.max(x, 0), spaceRect.width - taskWidth);
        const safeY = Math.min(Math.max(y, 0), spaceRect.height - taskHeight);

        return { x: safeX, y: safeY };
    };

    useEffect(() => {
        if (isMobileSize) return;
        const handleResize = debounce(() => {
            const spaceRect = spaceRef.current?.getBoundingClientRect();
            if (!spaceRect) return;

            const updatedTasks = tasks.map((task) => {
                const taskWidth = task.width || 270;
                const taskHeight = task.height || 250;

                const { x: safeX, y: safeY } = calculateSafePosition(
                    task.x,
                    task.y,
                    taskWidth,
                    taskHeight
                );

                return safeX !== task.x || safeY !== task.y
                    ? { ...task, x: safeX, y: safeY }
                    : task;
            });

            const tasksToUpdate = updatedTasks.filter(
                (task, index) =>
                    task.x !== tasks[index].x || task.y !== tasks[index].y
            );

            if (tasksToUpdate.length > 0) {
                dispatch(updateMultipleTasks(tasksToUpdate as Partial<Task>[]));
            }
        }, 250);

        window.addEventListener('resize', handleResize);
        handleResize(); // Run the handler once on mount to adjust positions

        return () => {
            window.removeEventListener('resize', handleResize);
            handleResize.cancel();
        };
    }, [tasks, dispatch, calculateSafePosition]);

    const handleSpaceClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (
                e.target !== e.currentTarget ||
                isDraggingRef.current ||
                e.button !== 0
            )
                return;

            clearFilters();

            if (canCreateTask) {
                const spaceRect = spaceRef.current?.getBoundingClientRect();
                if (spaceRect) {
                    const { x: safeX, y: safeY } = calculateSafePosition(
                        e.clientX - spaceRect.left,
                        e.clientY - spaceRect.top
                    );
                    const newTask: Omit<Task, '_id'> = {
                        taskName: '',
                        taskDescription: '',
                        x: safeX,
                        y: safeY,
                        progress: 'Not Started' as TaskProgress,
                        space: spaceId,
                        zIndex: getNewZIndex(),
                        subtasks: [],
                        parentTask: undefined,
                        ancestors: [],
                        width: 270,
                        height: 250,
                    };
                    addTask(newTask);
                    setCanCreateTask(false);
                    setTimeout(() => setCanCreateTask(true), COOLDOWN_TIME);
                }
            }
        },
        [canCreateTask, spaceId, getNewZIndex, dispatch, clearFilters]
    );

    const handleDragStart = () => {
        isDraggingRef.current = true;
    };

    const handleDragStop = () => {
        isDraggingRef.current = false;
    };

    useEffect(() => {
        if (spaceRef.current) {
            drop(spaceRef);
        }
    }, [drop]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, borderRadius: '200px' }}
            animate={{ opacity: 1, scale: 1, borderRadius: '0px' }}
            exit={{
                opacity: 0,
                scale: 0.9,
                translateY: 20,
                borderRadius: '500px',
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            ref={spaceRef}
            className={`relative w-full h-screen space-${spaceId} overflow-hidden`}
            style={{
                backgroundColor:
                    customBackgroundColor ||
                    `var(--${currentTheme}-space-background)`,
                backgroundImage:
                    wallpaper !== '/images/placeholder_image.webp'
                        ? `url(${wallpaper})`
                        : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: `0 4px 6px -1px var(--${currentTheme}-background-300), 0 2px 4px -1px var(--${currentTheme}-background-300)`,
                outline: `8px solid ${spaceOutlineColor}`,
                transition: 'background-color 0.3s ease-in-out',
            }}
            onMouseDown={handleSpaceClick}
        >
            {isMobileSize ? (
                <TaskListView spaceId={spaceId} />
            ) : (
                <>
                    {tasks.length === 0 && (
                        <AnimatePresence>
                            <motion.div
                                className="flex flex-col items-center justify-center h-full pointer-events-none"
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 3,
                                    delay: 1,
                                    ease: 'easeInOut',
                                }}
                            >
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 3,
                                        delay: 1,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <h1 className="text-center text-gray-200 text-5xl font-thin">
                                        emptiness is bliss
                                    </h1>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 3,
                                        delay: 2,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <p className="text-center text-gray-300 text-xl font-normal p-2 mt-2">
                                        click anywhere to add a task.
                                    </p>
                                    {selectedEmojis.length > 0 ||
                                        ((selectedProgresses.length > 0 ||
                                            selectedDueDateRange) && (
                                            <div
                                                className="flex flex-col items-center justify-center p-4 rounded-lg shadow-md pointer-events-auto bg-red-50 border-2"
                                                style={{
                                                    borderColor: `var(--${currentTheme}-accent-red)`,
                                                }}
                                            >
                                                <p className="text-center text-lg font-semibold mb-2 text-black">
                                                    Filters are applied - some
                                                    tasks may be hidden.
                                                </p>
                                                <button
                                                    className="btn btn-sm btn-outline cursor-pointer text-black"
                                                    onClick={clearFilters}
                                                >
                                                    Clear Filters
                                                </button>
                                            </div>
                                        ))}
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {tasks
                        .filter(
                            (task) =>
                                selectedEmojis.length === 0 ||
                                selectedEmojis.includes(task.emoji || '')
                        )
                        .map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task as unknown as Task}
                                onDragStart={handleDragStart}
                                onDragStop={handleDragStop}
                                getNewZIndex={getNewZIndex}
                            />
                        ))}
                    <SubtaskDrawer
                        ref={subtaskDrawerRef}
                        isOpen={isSubtaskDrawerOpen}
                        onClose={handleCloseDrawer}
                        maxZIndex={maxZIndex}
                    />
                </>
            )}
            <ControlPanel />
        </motion.div>
    );
});

export default Space;
