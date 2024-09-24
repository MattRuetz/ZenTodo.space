import { useDispatch } from 'react-redux';
import { AppDispatch, store } from '@/store/store';
import { addTaskOptimistic, addTaskAsync } from '@/store/tasksSlice';
import { Task } from '@/types';
import { generateTempId } from '@/app/utils/utils';
import { useAlert } from './useAlert';

export const useAddTask = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { showAlert } = useAlert();

    const addTask = async (task: Task) => {
        // **Task limit check**
        const tasksInSpace = store
            .getState()
            .tasks.tasks.filter((t: Task) => t.space === task.space);

        if (tasksInSpace.length >= 50) {
            showAlert(
                'Task limit reached. You cannot create more than 50 tasks in this space.',
                'notice'
            );
            return;
        }

        const tempId = generateTempId();
        const tempTask: Task = {
            ...task,
            _id: tempId,
            isTemp: true,
            subtasks: [],
        };

        // Dispatch optimistic update
        dispatch(addTaskOptimistic(tempTask));

        try {
            // Attempt to add task in the backend
            await dispatch(
                addTaskAsync({
                    task,
                    tempId,
                })
            ).unwrap();
            // Success
            showAlert('Task added!', 'success');
        } catch (error) {
            if (error instanceof Error) {
                // Error: rollback optimistic updates -- handled in the .rejected case in taskSlice extra reducers
                console.error('Failed to add task:', error);
                showAlert(error.message || 'Failed to add task', 'error');
            }
        }
    };

    return { addTask };
};
