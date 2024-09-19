import { useDeleteSpace } from '@/hooks/useDeleteSpace';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import { Task, SpaceData } from '@/types';
import { motion } from 'framer-motion';

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

    const numSubtasks =
        spaceOrTask === 'task' ? (objectToDelete as Task).subtasks.length : 0;

    return (
        <motion.div
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <motion.div
                className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm shadow-slate-900/50"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
                {spaceOrTask === 'task' ? (
                    <>
                        <h3 className="text-lg font-bold mb-4">Delete Task?</h3>
                        <p className="mb-4 px-2 bg-slate-700 rounded-md">
                            {numSubtasks > 0
                                ? `This task has ${numSubtasks} subtasks.`
                                : 'Are you sure you want to delete this task? This action cannot be undone.'}
                        </p>
                        <p className="mb-4">
                            Deleting this task will also delete all of its
                            subtasks.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="btn btn-ghost"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    performDeleteTask(objectToDelete as Task);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-xl font-bold mb-4">
                            Delete Space?
                        </h3>
                        <p className="mb-6 p-2 bg-slate-600 rounded-md">
                            Are you sure you want to delete this space? This
                            action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="btn btn-ghost"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    performDeleteSpace(
                                        objectToDelete as SpaceData
                                    );
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ConfirmDelete;
