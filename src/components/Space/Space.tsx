// src/components/Space.tsx
'use client';
import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    useMemo,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useDrop } from 'react-dnd';
// Import the new TaskListView component
import TaskListView from '../Mobile/TaskListView';
import TaskCard from '../TaskCards/TaskCard';
import SignUpForm from '../SignUpForm';
import SubtaskDrawer from '../Subtask/SubtaskDrawer';
import { RootState, AppDispatch } from '../../store/store';
import { updateTask } from '../../store/tasksSlice';
import {
    updateSpaceMaxZIndex,
    fetchSpaceMaxZIndex,
} from '../../store/spaceSlice';
import { setSubtaskDrawerOpen } from '@/store/uiSlice';
import { TaskProgress, Task } from '@/types';
import { selectTasksForSpace } from '@/store/selectors';
import { createSelector } from '@reduxjs/toolkit';
import { useClearEmojis } from '@/hooks/useClearEmojis';
import { useAddTask } from '@/hooks/useAddTask';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { isMobile, isTablet } from 'react-device-detect';
import ControlPanel from '../SuperSpace/ControlPanel';

// Memoized selectors

interface SpaceProps {
    spaceId: string;
}

export const selectSelectedEmojis = createSelector(
    (state: RootState) => state.spaces.currentSpace,
    (currentSpace) => currentSpace?.selectedEmojis || []
);

const Space: React.FC<SpaceProps> = React.memo(({ spaceId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTheme = useTheme();

    const isMobileSize = useIsMobileSize();
    const isMobileDevice = isMobile || isTablet;

    const { data: session, status: sessionStatus } = useSession();

    const tasks = useSelector((state: RootState) =>
        selectTasksForSpace(state, spaceId)
    );
    const currentSpace = useSelector(
        (state: RootState) => state.spaces.currentSpace
    );
    const selectedEmojis = useSelector(selectSelectedEmojis);
    const isSubtaskDrawerOpen = useSelector(
        (state: RootState) => state.ui.isSubtaskDrawerOpen
    );
    const wallpaper = useSelector(
        (state: RootState) => state.spaces.currentSpace?.wallpaper || ''
    );

    const { clearEmojis } = useClearEmojis(spaceId);

    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [maxZIndex, setMaxZIndex] = useState(currentSpace?.maxZIndex || 1);
    const [canCreateTask, setCanCreateTask] = useState(true);

    const isDraggingRef = useRef(false);
    const cursorEffectRef = useRef<HTMLDivElement>(null);
    const subtaskDrawerRef = useRef<HTMLDivElement>(null);
    const spaceRef = useRef<HTMLDivElement>(null);

    const COOLDOWN_TIME = 500; // ms

    const { addTask } = useAddTask();

    const normalizeZIndexValues = useCallback(() => {
        const sortedTasks = [...tasks].sort((a, b) => a.zIndex - b.zIndex);
        let newMaxZIndex = 0;

        const updatedTasks = sortedTasks.map((task, index) => {
            newMaxZIndex = index + 1;
            return { ...task, zIndex: newMaxZIndex };
        });

        updatedTasks.forEach((task) => {
            dispatch(
                updateTask({
                    _id: task._id as string,
                    zIndex: task.zIndex as number,
                })
            );
        });

        setMaxZIndex(newMaxZIndex);
        dispatch(updateSpaceMaxZIndex({ spaceId, maxZIndex: newMaxZIndex }));
    }, [tasks, spaceId, dispatch]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
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

    // Use this effect to fetch the maxZIndex from the database
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

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!session) {
                setCursorPosition({ x: e.clientX, y: e.clientY });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [session]);

    useEffect(() => {
        if (cursorEffectRef.current) {
            cursorEffectRef.current.style.left = `${cursorPosition.x}px`;
            cursorEffectRef.current.style.top = `${cursorPosition.y}px`;
        }
    }, [cursorPosition]);

    const calculateSafePosition = (x: number, y: number) => {
        const spaceRect = spaceRef.current?.getBoundingClientRect();
        if (!spaceRect) return { x, y };

        const taskWidth = 270; // Minimum width of a task card
        const taskHeight = 250; // Minimum height of a task card

        const safeX = Math.min(Math.max(x, 0), spaceRect.width - taskWidth);
        const safeY = Math.min(Math.max(y, 0), spaceRect.height - taskHeight);

        return { x: safeX, y: safeY };
    };

    const handleSpaceClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (
                e.target !== e.currentTarget ||
                isDraggingRef.current ||
                e.button !== 0 // only left click
            )
                return;

            if (canCreateTask) {
                clearEmojis();
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
        [session, canCreateTask, spaceId, getNewZIndex, dispatch]
    );

    const handleDragStart = () => {
        isDraggingRef.current = true;
    };
    const handleDragStop = () => {
        isDraggingRef.current = false;
    };

    // Combine the drop ref with the space ref
    useEffect(() => {
        if (spaceRef.current) {
            drop(spaceRef);
        }
    }, [drop]);

    const spaceOutlineColor = useSelector(
        (state: RootState) => state.spaces.currentSpace?.color
    );

    return (
        <motion.div
            initial={{
                opacity: 0,
                scale: 0.8,
                borderRadius: '200px',
            }}
            animate={{
                opacity: 1,
                scale: 1,
                borderRadius: '0px',
            }}
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
                backgroundColor: `var(--${currentTheme}-space-background)`,
                backgroundImage:
                    wallpaper !== '/images/placeholder_image.webp'
                        ? `url(${wallpaper})`
                        : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: `0 4px 6px -1px var(--${currentTheme}-background-300), 0 2px 4px -1px var(--${currentTheme}-background-300)`,
                outline: `8px solid ${spaceOutlineColor}`,
            }}
            onMouseDown={handleSpaceClick}
        >
            {isMobileSize || isMobileDevice ? (
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
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {tasks
                        .filter(
                            (task) =>
                                // !task.parentTask &&
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
                        isOpen={isSubtaskDrawerOpen as boolean}
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
