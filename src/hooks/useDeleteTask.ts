import { AppDispatch } from '@/store/store';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { deleteTask } from '@/store/tasksSlice';

interface UseDeleteTaskProps {
    deletingTasks: Set<string>;
    setDeletingTasks: (
        deletingTasks: (prev: Set<string>) => Set<string>
    ) => void;
}

export const useDeleteTask = ({
    deletingTasks,
    setDeletingTasks,
}: UseDeleteTaskProps) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleDelete = useCallback(
        async (taskId: string) => {
            if (deletingTasks.has(taskId)) return;

            setDeletingTasks((prev: Set<string>) => {
                const newSet = new Set(prev);
                newSet.add(taskId);
                return newSet;
            });

            try {
                const result = await dispatch(deleteTask(taskId)).unwrap();
                if (result.taskId !== taskId) {
                    throw new Error('Task ID mismatch');
                }
            } finally {
                setDeletingTasks((prev: Set<string>) => {
                    const newSet = new Set(prev);
                    newSet.delete(taskId);
                    return newSet;
                });
            }
        },
        [deletingTasks, dispatch, setDeletingTasks]
    );

    return { handleDelete };
};
