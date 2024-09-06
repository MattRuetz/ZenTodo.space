// src/components/Space.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import TaskCard from './TaskCard';
import SignUpForm from './SignUpForm';
import { RootState, AppDispatch } from '../store/store';
import { addLocalTask, updateLocalTask, fetchTasks } from '../store/tasksSlice';
import { TaskStatus, Task } from '@/types';

const Space: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const tasks = useSelector((state: RootState) => state.tasks.tasks);
    const localTasks = useSelector(
        (state: RootState) => state.tasks.localTasks
    );

    const taskStatus = useSelector((state: RootState) => state.tasks.status);
    const { data: session, status: sessionStatus } = useSession();
    const isDraggingRef = useRef(false);
    const [showSignUpForm, setShowSignUpForm] = useState(false);
    const [formPosition, setFormPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (sessionStatus === 'authenticated' && taskStatus === 'idle') {
            dispatch(fetchTasks());
        }
    }, [sessionStatus, taskStatus, dispatch]);

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
                status: 'Not Started' as TaskStatus,
                isVirgin: true, // Mark as local
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
            className="relative w-full h-screen bg-base-100"
            onMouseDown={handleSpaceClick}
        >
            {sessionStatus === 'loading' || taskStatus === 'loading' ? (
                <div>Loading...</div>
            ) : session ? (
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
