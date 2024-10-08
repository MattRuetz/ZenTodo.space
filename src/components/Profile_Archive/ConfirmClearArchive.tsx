import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { FaTrash } from 'react-icons/fa';
import { ComponentSpinner } from '../ComponentSpinner';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { clearArchivedTasks } from '@/store/tasksSlice';
import { useAlert } from '@/hooks/useAlert';

interface ConfirmClearArchiveProps {
    cancelClearArchive: () => void;
    archivedTasksCount: number;
}

const ConfirmClearArchive: React.FC<ConfirmClearArchiveProps> = ({
    cancelClearArchive,
    archivedTasksCount,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isDeleting, setIsDeleting] = useState(false);
    const currentTheme = useTheme();
    const { showAlert } = useAlert();

    const handleClearArchive = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleting(true);
        dispatch(clearArchivedTasks())
            .unwrap()
            .then(() => {
                showAlert(
                    'All archived tasks have been permanently deleted.',
                    'success'
                );
                cancelClearArchive();
            })
            .catch((error) => {
                showAlert(
                    'Failed to delete archived tasks. Please try again.',
                    'error'
                );
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    return (
        <>
            <div className="overlay w-full h-full absolute inset-0 bg-black/50 z-10"></div>
            <motion.div
                className="absolute inset-0 w-full h-full flex justify-center items-center"
                style={{
                    backgroundColor: `var(--${currentTheme}-accent-black)`,
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
                        backgroundColor: `var(--${currentTheme}-background-200)`,
                    }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                    <h3
                        className="text-xl font-bold mb-4"
                        style={{
                            color: `var(--${currentTheme}-text-default)`,
                        }}
                    >
                        Clear Archive?
                    </h3>
                    <p
                        className="mb-6 p-2 bg-red-500/10 ring-2 ring-red-500 rounded-md"
                        style={{
                            color: `var(--${currentTheme}-text-default)`,
                        }}
                    >
                        This will permanently delete all {archivedTasksCount}{' '}
                        archived tasks. This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-4">
                        <button
                            className="btn btn-ghost"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                            onClick={cancelClearArchive}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn bg-red-500/30 hover:bg-red-600/50 border-red-500"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                            onClick={handleClearArchive}
                        >
                            {isDeleting ? (
                                <ComponentSpinner />
                            ) : (
                                <span
                                    className={'delete-text flex items-center'}
                                >
                                    Clear Archive <FaTrash className="ml-2" />
                                </span>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
};

export default ConfirmClearArchive;
