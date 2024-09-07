// src/components/Space.tsx
'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { createSelector } from '@reduxjs/toolkit';
import TaskCard from './TaskCard';
import SignUpForm from './SignUpForm';
import { RootState, AppDispatch } from '../store/store';
import { addLocalTask, fetchTasks, updateTask } from '../store/tasksSlice';
import { TaskProgress, Task } from '@/types';
import { updateSpaceMaxZIndex, fetchSpaceMaxZIndex } from '../store/spaceSlice';

// Memoized selectors
const selectTasksForSpace = createSelector(
    [
        (state: RootState) => state.tasks.tasks,
        (state: RootState, spaceId: string) => spaceId,
    ],
    (tasks, spaceId) => tasks.filter((task) => task.space === spaceId)
);

const selectLocalTasks = (state: RootState) => state.tasks.localTasks;
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
    const currentSpace = useSelector((state: RootState) =>
        selectCurrentSpace(state, spaceId)
    );
    const tasks = useSelector((state: RootState) =>
        selectTasksForSpace(state, spaceId)
    );
    const localTasks = useSelector(selectLocalTasks);
    const taskStatus = useSelector(selectTaskStatus);
    const { data: session, status: sessionStatus } = useSession();
    const isDraggingRef = useRef(false);
    const [showSignUpForm, setShowSignUpForm] = useState(false);
    const [formPosition, setFormPosition] = useState({ x: 0, y: 0 });
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const cursorEffectRef = useRef<HTMLDivElement>(null);
    const [maxZIndex, setMaxZIndex] = useState(currentSpace?.maxZIndex || 1);
    const [resetTasks, setResetTasks] = useState<Task[]>([]);
    const initialLoadComplete = useRef(false);

    const getNewZIndex = useCallback(() => {
        const newZIndex = maxZIndex + 1 || 1;

        setMaxZIndex(newZIndex);
        dispatch(updateSpaceMaxZIndex({ spaceId, maxZIndex: newZIndex }));
        return newZIndex;
    }, [maxZIndex, spaceId, dispatch]);

    useEffect(() => {
        const loadTasks = async () => {
            if (
                sessionStatus === 'authenticated' &&
                taskStatus === 'idle' &&
                !initialLoadComplete.current
            ) {
                try {
                    await dispatch(fetchTasks(spaceId));
                    initialLoadComplete.current = true;
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                } finally {
                    onLoaded(); // Signal that loading is complete
                }
            } else if (
                sessionStatus !== 'loading' &&
                taskStatus !== 'loading'
            ) {
                onLoaded(); // Signal that loading is complete
            }
        };

        loadTasks();
    }, [sessionStatus, taskStatus, dispatch, spaceId, onLoaded]);

    useEffect(() => {
        if (tasks.length > 0 && initialLoadComplete.current) {
            const sortedTasks = [...tasks].sort((a, b) => a.zIndex - b.zIndex);

            const updatedTasks = sortedTasks.map((task, index) => ({
                ...task,
                zIndex: index + 1,
            }));

            setResetTasks(updatedTasks);

            // Fetch maxZIndex from the server
            dispatch(fetchSpaceMaxZIndex(spaceId))
                .then((action) => {
                    if (fetchSpaceMaxZIndex.fulfilled.match(action)) {
                        setMaxZIndex(action.payload);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching maxZIndex:', error);
                });

            // Reset the flag so this doesn't run again
            initialLoadComplete.current = false;
        }
    }, [tasks, spaceId, dispatch]);

    useEffect(() => {
        if (resetTasks.length > 0) {
            resetTasks.forEach((task) => {
                dispatch(updateTask(task));
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

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [session]);

    useEffect(() => {
        if (cursorEffectRef.current) {
            cursorEffectRef.current.style.left = `${cursorPosition.x}px`;
            cursorEffectRef.current.style.top = `${cursorPosition.y}px`;
        }
    }, [cursorPosition]);

    const handleSpaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) return;
        if (isDraggingRef.current) return;
        if (!session) {
            setFormPosition({ x: e.clientX, y: e.clientY });
            setShowSignUpForm(true);
        } else {
            const newTask: Task = {
                taskName: '',
                taskDescription: '',
                x: e.clientX,
                y: e.clientY,
                progress: 'Not Started' as TaskProgress,
                isVirgin: true, // Mark as local
                space: spaceId,
                zIndex: getNewZIndex(), //new tasks on top
            };
            dispatch(addLocalTask(newTask));
        }
    };

    const handleFormDrag = (newPosition: { x: number; y: number }) => {
        setFormPosition(newPosition);
    };

    const handleDragStart = () => {
        isDraggingRef.current = true;
    };

    const handleDragStop = () => {
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 0);
    };

    return (
        <div
            className={`relative w-full h-screen bg-base-100 space-${spaceId}`}
            onMouseDown={handleSpaceClick}
        >
            {!session && (
                <div ref={cursorEffectRef} className="cursor-effect" />
            )}
            {session ? (
                <>
                    {/* resetTasks exist after reload - their z-ind has been set to viable minimum */}
                    {(resetTasks.length > 0 ? resetTasks : tasks).map(
                        (task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onDragStart={handleDragStart}
                                onDragStop={handleDragStop}
                                getNewZIndex={getNewZIndex}
                            />
                        )
                    )}
                    {localTasks.map((task) => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onDragStart={handleDragStart}
                            onDragStop={handleDragStop}
                            isVirgin={true}
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
        </div>
    );
};

export default Space;
