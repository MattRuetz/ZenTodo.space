import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { addTaskOptimistic, addTaskAsync } from '@/store/tasksSlice';
import { Task } from '@/types';
import { generateTempId } from '@/app/utils/utils';

export const useAddTask = () => {
    const dispatch = useDispatch<AppDispatch>();

    const addTask = async (taskData: Omit<Task, '_id'>) => {
        const tempId = generateTempId();
        const tempTask: Task = {
            ...taskData,
            _id: tempId,
            isTemp: true,
            subtasks: [],
            ancestors: [],
        };

        // Dispatch optimistic update
        dispatch(addTaskOptimistic(tempTask));

        try {
            // Attempt to add task in the backend
            await dispatch(addTaskAsync({ task: taskData, tempId })).unwrap();
            // Success: The new task with a real ID is added in the fulfilled case
        } catch (error) {
            // Error: rollback optimistic updates -- handled in the .rejected case in taskSlice extra reducers
            console.error('Failed to add task:', error);
        }
    };

    return { addTask };
};
