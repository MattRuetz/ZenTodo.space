// src/components/TaskCards/ConfirmDelete.tsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaTrash } from 'react-icons/fa';

import { useDeleteSpace } from '@/hooks/useDeleteSpace';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import { useTheme } from '@/hooks/useTheme';

import { ComponentSpinner } from '../ComponentSpinner';

import { Task, SpaceData } from '@/types';

interface ConfirmDeleteProps {
    objectToDelete: Task | SpaceData;
    cancelDelete: () => void;
    spaceOrTask: 'space' | 'task';
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
    objectToDelete,
    cancelDelete,
    spaceOrTask,
}) => {
    const { performDeleteTask } = useDeleteTask();
    const { performDeleteSpace } = useDeleteSpace();
    const [isDeleting, setIsDeleting] = useState(false);
    const currentTheme = useTheme();

    const numSubtasks = useMemo(() => {
        return spaceOrTask === 'task'
            ? (objectToDelete as Task).subtasks.length
            : 0;
    }, [objectToDelete, spaceOrTask]);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleting(true);
        if (spaceOrTask === 'space') {
            performDeleteSpace(objectToDelete as SpaceData);
        } else {
            performDeleteTask(objectToDelete as Task);
        }
    };

    const modalBackgroundStyle = {
        backgroundColor: `var(--${currentTheme}-accent-black)`, // Use theme color for background
        opacity: 0.5,
        zIndex: 100000,
    };

    const modalContentStyle = {
        backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color for modal background
    };

    const textColorStyle = {
        color: `var(--${currentTheme}-text-default)`,
    };

    return (
        <motion.div
            className="absolute inset-0 w-full h-full flex justify-center items-center"
            style={modalBackgroundStyle}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
        >
            <motion.div
                className="p-6 rounded-lg shadow-lg max-w-sm"
                style={modalContentStyle}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
                {spaceOrTask === 'task' ? (
                    <>
                        <h3
                            className="text-lg font-bold mb-4"
                            style={textColorStyle}
                        >
                            Delete Task?
                        </h3>
                        <p
                            className="mb-4 px-2 rounded-md bg-white/10 ring-1 ring-red-500"
                            style={textColorStyle}
                        >
                            {numSubtasks > 0
                                ? `This task has ${numSubtasks} subtasks.`
                                : 'Are you sure you want to delete this task? This action cannot be undone.'}
                        </p>
                        <p className="mb-4" style={textColorStyle}>
                            Deleting this task will also delete all of its
                            subtasks.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="btn btn-ghost"
                                style={textColorStyle}
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="relative btn bg-red-500/30 hover:bg-red-600/50 border-red-500 min-w-24"
                                style={textColorStyle}
                                onClick={handleDelete}
                            >
                                {isDeleting ? (
                                    <ComponentSpinner />
                                ) : (
                                    <span
                                        className={
                                            'delete-text flex items-center'
                                        }
                                    >
                                        Delete <FaTrash className="ml-2" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3
                            className="text-xl font-bold mb-4"
                            style={textColorStyle}
                        >
                            Delete Space?
                        </h3>
                        <p
                            className="mb-6 p-2 bg-red-500/10 ring-2 ring-red-500 rounded-md"
                            style={textColorStyle}
                        >
                            All tasks in the space will also be deleted. This
                            action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="btn btn-ghost"
                                style={textColorStyle}
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="relative btn bg-red-500/30 hover:bg-red-600/50 border-red-500 min-w-24"
                                style={textColorStyle}
                                onClick={handleDelete}
                            >
                                {isDeleting ? (
                                    <ComponentSpinner />
                                ) : (
                                    <span
                                        className={
                                            'delete-text flex items-center'
                                        }
                                    >
                                        Delete <FaTrash className="ml-2" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ConfirmDelete;
