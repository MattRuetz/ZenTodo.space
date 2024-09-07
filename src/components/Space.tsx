// src/components/Space.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { createSelector } from '@reduxjs/toolkit';
import TaskCard from './TaskCard';
import SignUpForm from './SignUpForm';
import { RootState, AppDispatch } from '../store/store';
import { addLocalTask, fetchTasks } from '../store/tasksSlice';
import { TaskProgress, Task } from '@/types';

// Memoized selectors
const selectTasksForSpace = createSelector(
    [
        (state: RootState) => state.tasks.tasks,
        (state: RootState, spaceId: string) => spaceId,
    ],
    (tasks, spaceId) => tasks.filter((task) => task.spaceId === spaceId)
);

const selectLocalTasks = (state: RootState) => state.tasks.localTasks;
const selectTaskStatus = (state: RootState) => state.tasks.status;

interface SpaceProps {
    spaceId: string;
    onLoaded: () => void;
}

const Space: React.FC<SpaceProps> = ({ spaceId, onLoaded }) => {
    const dispatch = useDispatch<AppDispatch>();
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

    useEffect(() => {
        const loadTasks = async () => {
            if (sessionStatus === 'authenticated' && taskStatus === 'idle') {
                try {
                    await dispatch(fetchTasks(spaceId));
                    onLoaded(); // Signal that loading is complete
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                    onLoaded(); // Signal loading complete even on error
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
                spaceId: spaceId,
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
                    {tasks.map((task) => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onDragStart={handleDragStart}
                            onDragStop={handleDragStop}
                        />
                    ))}
                    {localTasks.map((task) => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onDragStart={handleDragStart}
                            onDragStop={handleDragStop}
                            isVirgin={true}
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
