import { useDispatch } from 'react-redux';
import {
    duplicateTasksOptimistic,
    duplicateTasksAsync,
    rollbackDuplicateTasks,
} from '../store/tasksSlice';
import { Task } from '../types';
import {
    duplicateTaskWithTempIds,
    fetchAllTasksFromState,
} from '@/app/utils/optimisticUpdates';
import { AppDispatch, RootState } from '@/store/store';

export const useDuplicateTask = () => {
    const dispatch = useDispatch<AppDispatch>();

    const duplicateTask = async (task: Task, tasksState: Task[]) => {
        // Pre-fetch all necessary task objects
        if (!task._id) {
            console.error('Task ID is undefined');
            return;
        }
        const taskMap = await fetchAllTasksFromState(task._id, tasksState);

        // Generate duplicated tasks with temporary IDs
        const { duplicatedTasks } = duplicateTaskWithTempIds(task, taskMap);

        // Dispatch optimistic update
        dispatch(duplicateTasksOptimistic(duplicatedTasks));

        try {
            // Attempt to duplicate tasks in the backend
            const tasksToDuplicate = duplicatedTasks.map((t) => ({
                ...t,
                isTemp: undefined,
            }));
            await dispatch(duplicateTasksAsync(tasksToDuplicate)).unwrap();
            // Success: IDs are updated in the fulfilled case
        } catch (error) {
            // Error: rollback optimistic updates
            const tempIds = duplicatedTasks.map((t) => t._id as string);
            dispatch(rollbackDuplicateTasks(tempIds));
            console.error('Failed to duplicate tasks:', error);
        }
    };

    return { duplicateTask };
};
