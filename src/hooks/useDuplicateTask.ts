import { useDispatch } from 'react-redux';
import {
    duplicateTasksOptimistic,
    duplicateTasksAsync,
} from '../store/tasksSlice';
import { Task } from '../types';
import {
    duplicateTaskWithTempIds,
    fetchAllTasksFromState,
} from '@/app/utils/optimisticUpdates';
import { AppDispatch } from '@/store/store';
import { useAlert } from './useAlert';

export const useDuplicateTask = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { showAlert } = useAlert();
    const duplicateTask = async (task: Task, tasksState: Task[]) => {
        // console.log('tasksState', tasksState);
        // Pre-fetch all necessary task objects
        if (!task._id) {
            console.error('Task ID is undefined');
            return;
        }
        const taskMap: Map<string, Task> = fetchAllTasksFromState(tasksState);

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
            showAlert(
                `Duplicated task${
                    task.subtasks.length > 0
                        ? ` + ${task.subtasks.length} subtask${
                              task.subtasks.length > 1 ? 's' : ''
                          }`
                        : ''
                }!`,
                'success'
            );
        } catch (error) {
            // Error: rollback optimistic updates -- handled in the .rejected case in taskSlice extra reducers
            console.error('Failed to duplicate tasks:', error);
            showAlert('Failed to duplicate tasks', 'error');
        }
    };

    return { duplicateTask };
};
