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
import { AppDispatch, store } from '@/store/store';
import { useAlert } from './useAlert';

export const useDuplicateTask = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { showAlert } = useAlert();

    const duplicateTask = async (task: Task, tasksState: Task[]) => {
        if (!task._id) {
            console.error('Task ID is undefined');
            return;
        }
        const taskMap: Map<string, Task> = fetchAllTasksFromState(tasksState);

        // Generate duplicated tasks with temporary IDs
        const { duplicatedTasks } = duplicateTaskWithTempIds(task, taskMap);

        // **Task limit check**
        const spaceId = task.space;
        const tasksInSpace = store
            .getState()
            .tasks.tasks.filter((t: Task) => t.space === spaceId);

        if (tasksInSpace.length + duplicatedTasks.length > 50) {
            showAlert(
                'Task limit reached. Cannot duplicate tasks because it would exceed the limit of 50 tasks in the space.',
                'notice'
            );
            return;
        }

        // Dispatch optimistic update
        dispatch(duplicateTasksOptimistic(duplicatedTasks));

        try {
            // Attempt to duplicate tasks in the backend
            const tasksToDuplicate = duplicatedTasks.map((t) => ({
                ...t,
                isTemp: undefined,
            }));
            const result = await dispatch(
                duplicateTasksAsync(tasksToDuplicate)
            ).unwrap();
            console.log('result', result);
            // Success
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
            return result;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Failed to duplicate tasks:', error);
                showAlert(
                    error.message || 'Failed to duplicate tasks',
                    'error'
                );
            }
        }
    };

    return { duplicateTask };
};
