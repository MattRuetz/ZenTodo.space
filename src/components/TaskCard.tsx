// src/components/TaskCard.tsx
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import debounce from 'lodash.debounce';
import { useDispatch } from 'react-redux';
import {
    updateTask,
    deleteTask,
    addTask,
    updateLocalTask,
    removeLocalTask,
} from '../store/tasksSlice';
import { AppDispatch } from '../store/store';
import { defaultSerializeQueryArgs } from '@reduxjs/toolkit/query';
import DragHandle from './DragHandle';
import TaskCardToolBar from './TaskCardToolBar';
import { Task, TaskProgress } from '@/types';

interface TaskCardProps {
    task: Task;
    onDragStart: () => void;
    onDragStop: () => void;
    isVirgin?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
    task,
    onDragStart,
    onDragStop,
    isVirgin = false,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [localTask, setLocalTask] = useState(task);
    // These are all states for the task fadeaway
    const [isHovering, setIsHovering] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [opacity, setOpacity] = useState(1);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [deletingTasks, setDeletingTasks] = useState<Set<string>>(new Set());

    // Debounced update function
    const debouncedUpdate = useCallback(
        debounce((updatedTask: Task) => {
            if (isVirgin) {
                if (updatedTask.taskName || updatedTask.taskDescription) {
                    dispatch(addTask(updatedTask));
                } else {
                    dispatch(updateLocalTask(updatedTask));
                }
            } else {
                dispatch(updateTask(updatedTask));
            }
        }, 500),
        [isVirgin]
    );

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const updatedTask = { ...localTask, [e.target.name]: e.target.value };
        setLocalTask(updatedTask);
        debouncedUpdate(updatedTask);
    };

    const handleProgressChange = (newProgress: TaskProgress) => {
        const updatedTask = { ...localTask, progress: newProgress };
        setLocalTask(updatedTask);
        if (isVirgin) {
            dispatch(updateLocalTask(updatedTask));
        } else {
            dispatch(updateTask(updatedTask));
        }
    };

    const handleDragStop = (e: any, data: any) => {
        const updatedTask = { ...localTask, x: data.x, y: data.y };
        setLocalTask(updatedTask);
        if (isVirgin) {
            dispatch(updateLocalTask(updatedTask));
        } else {
            dispatch(updateTask(updatedTask));
        }
        onDragStop();
    };

    // Delete Non-local tasks
    const handleDelete = async (taskId: string) => {
        if (deletingTasks.has(taskId)) return; // Prevent duplicate calls

        setDeletingTasks((prev) => new Set(prev).add(taskId));
        try {
            await dispatch(deleteTask(taskId)).unwrap();
        } finally {
            setDeletingTasks((prev) => {
                const newSet = new Set(prev);
                newSet.delete(taskId);
                return newSet;
            });
        }
    };

    // This handles non-virgin empty tasks self-deleting
    useEffect(() => {
        let fadeInterval: NodeJS.Timeout;
        const shouldFadeOut =
            !isHovering &&
            !isFocused &&
            !localTask.taskName &&
            !localTask.taskDescription;

        if (shouldFadeOut) {
            timeoutRef.current = setTimeout(() => {
                fadeInterval = setInterval(() => {
                    setOpacity((prevOpacity) => {
                        if (prevOpacity <= 0) {
                            clearInterval(fadeInterval);
                            isVirgin
                                ? dispatch(removeLocalTask(localTask._id ?? ''))
                                : handleDelete(localTask._id ?? '');
                            return 0;
                        }
                        return prevOpacity - 0.1;
                    });
                }, 100);
            }, 3000);
        } else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            setOpacity(1);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (fadeInterval) {
                clearInterval(fadeInterval);
            }
        };
    }, [
        isHovering,
        isFocused,
        localTask.taskName,
        localTask.taskDescription,
        dispatch,
        localTask._id,
    ]);

    return (
        <Draggable
            defaultPosition={{ x: task.x, y: task.y }}
            bounds="parent"
            handle=".drag-handle"
            onStart={onDragStart}
            onStop={handleDragStop}
        >
            <div
                className="absolute w-60 p-4 bg-base-300 shadow cursor-move flex flex-col space-y-2 rounded-xl"
                style={{ opacity }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <DragHandle />

                <input
                    type="text"
                    name="taskName"
                    placeholder="Task Name"
                    value={localTask.taskName}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="input input-bordered w-full"
                />
                <textarea
                    name="taskDescription"
                    placeholder="Task Description"
                    value={localTask.taskDescription}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="textarea textarea-bordered w-full"
                />
                <TaskCardToolBar
                    onDelete={() => handleDelete(task._id ?? '')}
                    progress={localTask.progress}
                    onProgressChange={handleProgressChange}
                />
            </div>
        </Draggable>
    );
};

export default TaskCard;
