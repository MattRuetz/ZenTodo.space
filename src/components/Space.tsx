// src/components/Space.tsx
'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { createSelector } from '@reduxjs/toolkit';
import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard';
import SignUpForm from './SignUpForm';
import SubtaskDrawer from './SubtaskDrawer';
import { RootState, AppDispatch } from '../store/store';
import { addTask, fetchTasks, updateTask } from '../store/tasksSlice';
import { updateSpaceMaxZIndex, fetchSpaceMaxZIndex } from '../store/spaceSlice';
import { setSubtaskDrawerOpen } from '@/store/uiSlice';
import { TaskProgress, Task } from '@/types';

// Memoized selectors
const selectTasksForSpace = createSelector(
    [
        (state: RootState) => state.tasks.tasks,
        (state: RootState, spaceId: string) => spaceId,
    ],
    (tasks, spaceId) => {
        const tasksInSpace = tasks.filter(
            (task) => task.space === spaceId && !task.parentTask
        );
        return tasksInSpace.map((task) => ({
            ...task,
            subtasks: tasks.filter(
                (subtask) => subtask.parentTask === task._id
            ),
        }));
    }
);
const selectTaskStatus = (state: RootState) => state.tasks.status;
const selectCurrentSpace = createSelector(
    [
        (state: RootState) => state.spaces.spaces,
        (_, spaceId: string) => spaceId,
    ],
    (spaces, spaceId) => spaces.find((space) => space._id === spaceId)
);

interface SpaceProps {
    spaceId: string;
    onLoaded: () => void;
}

const Space: React.FC<SpaceProps> = ({ spaceId, onLoaded }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: session, status: sessionStatus } = useSession();
    const tasks = useSelector((state: RootState) =>
        selectTasksForSpace(state, spaceId)
    );
    const taskStatus = useSelector(selectTaskStatus);
    const currentSpace = useSelector((state: RootState) =>
        selectCurrentSpace(state, spaceId)
    );
    const isDrawerOpen = useSelector(
        (state: RootState) => state.ui.isSubtaskDrawerOpen
    );

    const [showSignUpForm, setShowSignUpForm] = useState(false);
    const [formPosition, setFormPosition] = useState({ x: 0, y: 0 });
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [maxZIndex, setMaxZIndex] = useState(currentSpace?.maxZIndex || 1);
    const [resetTasks, setResetTasks] = useState<Task[]>([]);
    const [canCreateTask, setCanCreateTask] = useState(true);

    const isDraggingRef = useRef(false);
    const cursorEffectRef = useRef<HTMLDivElement>(null);
    const initialLoadComplete = useRef(false);
    const subtaskDrawerRef = useRef<HTMLDivElement>(null);
    const spaceRef = useRef<HTMLDivElement>(null);

    const COOLDOWN_TIME = 500; // ms

    const getNewZIndex = useCallback(() => {
        const newZIndex = maxZIndex + 1;
        setMaxZIndex(newZIndex);
        dispatch(updateSpaceMaxZIndex({ spaceId, maxZIndex: newZIndex }));
        return newZIndex;
    }, [maxZIndex, spaceId, dispatch]);

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

                return { x: offset.x - 150, y: offset.y - 150 }; // Drop outside drawer, convert to task
            },
        }),
        []
    );

    useEffect(() => {
        const loadTasksAndUpdateMaxZIndex = async () => {
            if (taskStatus === 'idle' && !initialLoadComplete.current) {
                try {
                    await dispatch(fetchTasks(spaceId));
                    const fetchMaxZIndexAction = await dispatch(
                        fetchSpaceMaxZIndex(spaceId)
                    );

                    if (
                        fetchSpaceMaxZIndex.fulfilled.match(
                            fetchMaxZIndexAction
                        )
                    ) {
                        const fetchedMaxZIndex = fetchMaxZIndexAction.payload;
                        setMaxZIndex(fetchedMaxZIndex);

                        // Calculate the actual max zIndex from tasks
                        const actualMaxZIndex = tasks.reduce(
                            (max, task) => Math.max(max, task.zIndex),
                            0
                        );

                        // Update the maxZIndex on the server if it's different
                        if (actualMaxZIndex) {
                            await dispatch(
                                updateSpaceMaxZIndex({
                                    spaceId,
                                    maxZIndex: actualMaxZIndex,
                                })
                            );
                            setMaxZIndex(actualMaxZIndex);
                        }
                    }

                    initialLoadComplete.current = true;
                    onLoaded();
                } catch (error) {
                    console.error(
                        'Error loading tasks or updating maxZIndex:',
                        error
                    );
                }
            }
        };

        loadTasksAndUpdateMaxZIndex();
    }, [dispatch, spaceId, taskStatus, tasks, onLoaded]);

    useEffect(() => {
        if (tasks.length > 0 && initialLoadComplete.current) {
            const updatedTasks = [...tasks]
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((task, index) => ({ ...task, zIndex: index + 1 }));

            setResetTasks(updatedTasks);

            // Fetch maxZIndex from the server
            dispatch(fetchSpaceMaxZIndex(spaceId))
                .then((action) => {
                    if (fetchSpaceMaxZIndex.fulfilled.match(action)) {
                        setMaxZIndex(action.payload);
                    }
                })
                .catch((error) =>
                    console.error('Error fetching maxZIndex:', error)
                );

            // Reset the flag so this doesn't run again
            initialLoadComplete.current = false;
        }
    }, [tasks, spaceId, dispatch]);

    useEffect(() => {
        if (resetTasks.length > 0) {
            resetTasks.forEach((task) => {
                if (task._id) {
                    dispatch(updateTask({ ...task, _id: task._id }));
                }
            });
            setResetTasks([]);
        }
    }, [resetTasks, dispatch]);

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

    const handleSpaceClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target !== e.currentTarget || isDraggingRef.current) return;

            if (!session) {
                setFormPosition({ x: e.clientX, y: e.clientY });
                setShowSignUpForm(true);
            } else if (canCreateTask) {
                const newTask: Omit<Task, '_id'> = {
                    taskName: '',
                    taskDescription: '',
                    x: e.clientX,
                    y: e.clientY,
                    progress: 'Not Started' as TaskProgress,
                    space: spaceId,
                    zIndex: getNewZIndex(),
                    subtasks: [],
                    parentTask: '',
                };
                dispatch(addTask(newTask));
                setCanCreateTask(false);
                setTimeout(() => setCanCreateTask(true), COOLDOWN_TIME);
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
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 0);
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
                    {(resetTasks.length > 0 ? resetTasks : tasks).map(
                        (task) => (
                            <TaskCard
                                key={task._id}
                                task={task as Task}
                                onDragStart={handleDragStart}
                                onDragStop={handleDragStop}
                                getNewZIndex={getNewZIndex}
                                subtasks={task.subtasks}
                            />
                        )
                    )}
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
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
            />
        </div>
    );
};

export default Space;
