// src/components/Mobile/MobileAddTaskButton.tsx
import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCheck, FaPlus } from 'react-icons/fa';

import { useTheme } from '@/hooks/useTheme';
import { useAddTask } from '@/hooks/useAddTask';
import { useAddNewSubtask } from '@/hooks/useAddNewSubtask';
import { Task, TaskProgress } from '@/types';
import { updateSpace, updateSpaceSelectedEmojis } from '@/store/spaceSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';

interface MobileAddTaskButtonProps {
    currentParent: Task | null;
    spaceId: string;
    onAddTask: () => void;
}

export const MobileAddTaskButton: React.FC<MobileAddTaskButtonProps> =
    React.memo(({ currentParent, spaceId, onAddTask }) => {
        const currentTheme = useTheme();
        const dispatch = useDispatch<AppDispatch>();
        const [justAddedTask, setJustAddedTask] = useState(false);
        const { addTask } = useAddTask();
        const { addNewSubtask } = useAddNewSubtask();
        useEffect(() => {
            if (justAddedTask) {
                const timer = setTimeout(() => {
                    setJustAddedTask(false);
                }, 1000);
                return () => clearTimeout(timer); // Cleanup timer on unmount
            }
        }, [justAddedTask]);

        const createSubtask = useCallback(() => {
            if (!currentParent) return;

            const newSubtask: Omit<Task, '_id'> = {
                taskName: 'New Subtask',
                taskDescription: '',
                x: currentParent.x || 0,
                y: currentParent.y || 0,
                progress: 'Not Started' as TaskProgress,
                space: currentParent.space || '',
                zIndex: currentParent.zIndex || 0,
                subtasks: [],
                parentTask: currentParent._id as string,
                ancestors: currentParent.ancestors
                    ? [...currentParent.ancestors, currentParent._id as string]
                    : [currentParent._id as string],
                width: 100,
                height: 100,
                emoji: '',
            };

            return addNewSubtask({
                subtask: newSubtask,
                parentId: currentParent._id as string,
                position: 'start',
            });
        }, [currentParent, addNewSubtask]);

        const createTask = useCallback(() => {
            const newTask: Omit<Task, '_id'> = {
                taskName: '',
                taskDescription: '',
                x: Math.floor(Math.random() * 300) + 1,
                y: Math.floor(Math.random() * 300) + 1,
                progress: 'Not Started' as TaskProgress,
                space: spaceId,
                zIndex: 0,
                subtasks: [],
                parentTask: undefined,
                ancestors: [],
                width: 270,
                height: 250,
            };

            return addTask(newTask);
        }, [spaceId, addTask]);

        const clearEmojiFilter = useCallback(() => {
            dispatch(
                updateSpaceSelectedEmojis({
                    spaceId: spaceId,
                    selectedEmojis: [],
                })
            );
        }, [currentParent, dispatch]);

        const handleAddTask = useCallback(() => {
            if (justAddedTask) return;

            const taskPromise = currentParent ? createSubtask() : createTask();
            taskPromise?.then(() => {
                setJustAddedTask(true);
                clearEmojiFilter();
                onAddTask();
            });
        }, [
            justAddedTask,
            currentParent,
            createSubtask,
            createTask,
            onAddTask,
            clearEmojiFilter,
        ]);

        return (
            <div
                className="flex flex-col justify-end items-end fixed bottom-4 right-4 w-auto gap-2"
                style={{
                    zIndex: 1000,
                }}
            >
                <button
                    className="btn btn-circle btn-md flex justify-center items-center shadow-md"
                    style={{
                        backgroundColor: `var(--${currentTheme}-accent-blue)`,
                        color: `var(--${currentTheme}-emphasis-dark)`,
                    }}
                    onClick={handleAddTask}
                >
                    <AnimatePresence>
                        <motion.div
                            key={justAddedTask ? 'check' : 'plus'} // Add a key to help AnimatePresence identify the elements
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {justAddedTask ? <FaCheck /> : <FaPlus />}
                        </motion.div>
                    </AnimatePresence>
                </button>
            </div>
        );
    });

export default MobileAddTaskButton;
