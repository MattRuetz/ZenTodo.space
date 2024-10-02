import { useDeleteSpace } from '@/hooks/useDeleteSpace';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import { Task, SpaceData } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

const ConfirmDelete = ({
    objectToDelete,
    cancelDelete,
    spaceOrTask,
}: {
    objectToDelete: Task | SpaceData;
    cancelDelete: () => void;
    spaceOrTask: 'space' | 'task';
}) => {
    const { performDeleteTask } = useDeleteTask();
    const { performDeleteSpace } = useDeleteSpace();
    const [isDeleting, setIsDeleting] = useState(false);
    const currentTheme = useTheme();

    const numSubtasks =
        spaceOrTask === 'task' ? (objectToDelete as Task).subtasks.length : 0;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleting(true);
        if (spaceOrTask === 'space') {
            performDeleteSpace(objectToDelete as SpaceData);
        } else {
            performDeleteTask(objectToDelete as Task);
        }
    };

    console.log(objectToDelete);

    return (
        <motion.div
            className="absolute inset-0 w-full h-full flex justify-center items-center"
            style={{
                backgroundColor: `var(--${currentTheme}-accent-black)`, // Use theme color for background
                opacity: 0.5,
                zIndex: 100000,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
        >
            <motion.div
                className="p-6 rounded-lg shadow-lg max-w-sm"
                style={{
                    backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color for modal background
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
                {spaceOrTask === 'task' ? (
                    <>
                        <h3
                            className="text-lg font-bold mb-4"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                        >
                            Delete Task?
                        </h3>
                        <p
                            className="mb-4 px-2 rounded-md bg-white/10 ring-1 ring-red-500"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                        >
                            {numSubtasks > 0
                                ? `This task has ${numSubtasks} subtasks.`
                                : 'Are you sure you want to delete this task? This action cannot be undone.'}
                        </p>
                        <p
                            className="mb-4"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                        >
                            Deleting this task will also delete all of its
                            subtasks.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="btn btn-ghost"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }} // Use theme color
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }} // Use theme color
                                onClick={handleDelete}
                            >
                                <span
                                    className={`${
                                        isDeleting ? 'invisible' : 'visible'
                                    } delete-text`}
                                >
                                    Delete
                                </span>
                                <span
                                    className={`${
                                        isDeleting ? 'visible' : 'invisible'
                                    } delete-spinner loading loading-ring text-slate-200 loading-lg`}
                                ></span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3
                            className="text-xl font-bold mb-4"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                        >
                            Delete Space?
                        </h3>
                        <p
                            className="mb-6 p-2 bg-red-500/10 ring-2 ring-red-500 rounded-md"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                        >
                            All tasks in the space will also be deleted. This
                            action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="btn btn-ghost"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }} // Use theme color
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }} // Use theme color
                                onClick={handleDelete}
                            >
                                <span
                                    className={`${
                                        isDeleting ? 'invisible' : 'visible'
                                    } delete-text`}
                                >
                                    Delete
                                </span>
                                <span
                                    className={`${
                                        isDeleting ? 'visible' : 'invisible'
                                    } delete-spinner loading loading-ring text-slate-200 loading-lg`}
                                ></span>
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ConfirmDelete;
