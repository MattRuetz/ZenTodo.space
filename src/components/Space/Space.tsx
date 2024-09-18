// src/components/Space.tsx
'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useDrop } from 'react-dnd';
import TaskCard from '../TaskCards/TaskCard';
import SignUpForm from '../SignUpForm';
import SubtaskDrawer from '../Subtask/SubtaskDrawer';
import { RootState, AppDispatch } from '../../store/store';
import { fetchTasks, updateTask } from '../../store/tasksSlice';
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

// Memoized selectors

interface SpaceProps {
    spaceId: string;
    onLoaded: () => void;
}

export const selectSelectedEmojis = createSelector(
    (state: RootState) => state.spaces.currentSpace,
    (currentSpace) => currentSpace?.selectedEmojis || []
);

const Space: React.FC<SpaceProps> = React.memo(({ spaceId, onLoaded }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: session, status: sessionStatus } = useSession();
    const tasks = useSelector((state: RootState) =>
        selectTasksForSpace(state, spaceId)
    );
    const currentSpace = useSelector(
        (state: RootState) => state.spaces.currentSpace
    );
    const selectedEmojis = useSelector(selectSelectedEmojis);
    const isDrawerOpen = useSelector(
        (state: RootState) => state.ui.isSubtaskDrawerOpen
    );
    const isGlobalDragging = useSelector(
        (state: RootState) => state.ui.isGlobalDragging
    );

    const { clearEmojis } = useClearEmojis(spaceId);

    const [showSignUpForm, setShowSignUpForm] = useState(false);
    const [formPosition, setFormPosition] = useState({ x: 0, y: 0 });
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

        console.log('updatedTasks', updatedTasks);

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
        return newZIndex;
    }, [maxZIndex, spaceId, dispatch]);

    useEffect(() => {
        dispatch(fetchSpaceMaxZIndex(spaceId));
        dispatch(fetchTasks());
        console.log('tasks', tasks);
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
            if (e.target !== e.currentTarget || isDraggingRef.current) return;

            if (!session) {
                setFormPosition({ x: e.clientX, y: e.clientY });
                setShowSignUpForm(true);
            } else if (canCreateTask) {
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

    const handleFormDrag = (newPosition: { x: number; y: number }) =>
        setFormPosition(newPosition);

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

    return (
        <div
            ref={spaceRef}
            className={`relative w-full h-screen bg-base-100 space-${spaceId}`}
            onMouseDown={handleSpaceClick}
        >
            {!session && (
                <div ref={cursorEffectRef} className="cursor-effect" />
            )}
            {session ? (
                <>
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
                </>
            ) : (
                showSignUpForm && (
                    <SignUpForm
                        position={formPosition}
                        onClose={() => setShowSignUpForm(false)}
                        onDrag={handleFormDrag}
                    />
                )
            )}
            <SubtaskDrawer
                ref={subtaskDrawerRef}
                isOpen={isDrawerOpen as boolean}
                onClose={handleCloseDrawer}
            />
        </div>
    );
});

export default Space;
