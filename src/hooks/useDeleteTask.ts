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
            console.log('useDeleteTask');
            console.log(deletingTasks);
            console.log('taskId', taskId);

            if (deletingTasks.has(taskId)) return;

            setDeletingTasks((prev: Set<string>) => {
                const newSet = new Set(prev);
                newSet.add(taskId);
                return newSet;
            });

            try {
                const result = await dispatch(deleteTask(taskId)).unwrap();
                if (result !== taskId) {
                    throw new Error(result);
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
