import { useDispatch } from 'react-redux';
import { AppDispatch, store } from '@/store/store';
import {
    addTaskOptimistic,
    addTaskAsync,
    deleteTaskOptimistic,
} from '@/store/tasksSlice';
import {
    replaceTempTaskWithRealTask,
    updateTaskInPlace,
} from '@/store/tasksSlice';
import {
    updateSpaceTaskOrderAsync,
    updateSpaceTaskOrderOptimistic,
    updateTaskOrderAfterReplace,
} from '@/store/spaceSlice';
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

        // Dispatch optimistic update for adding the task
        dispatch(addTaskOptimistic(tempTask));

        // Get the current taskOrder for the space
        const currentSpace = store
            .getState()
            .spaces.spaces.find((s) => s._id === task.space);
        const currentTaskOrder = currentSpace?.taskOrder || [];

        // Create a new taskOrder with the new task at the beginning
        const newTaskOrder = [tempId, ...currentTaskOrder];

        // Dispatch optimistic update for updating the space's taskOrder
        dispatch(
            updateSpaceTaskOrderOptimistic({
                spaceId: task.space as string,
                taskOrder: newTaskOrder,
            })
        );

        try {
            // Attempt to add task in the backend
            const result = await dispatch(
                addTaskAsync({
                    task,
                    tempId,
                })
            ).unwrap();

            // Update the task in place instead of replacing it
            dispatch(
                updateTaskInPlace({
                    tempId,
                    newTask: result.newTask,
                })
            );

            // Update the taskOrder in the space
            dispatch(
                updateTaskOrderAfterReplace({
                    spaceId: task.space as string,
                    tempId,
                    newTaskId: result.newTask._id,
                })
            );

            // Success
            showAlert('Task added!', 'success');
        } catch (error) {
            // Error: rollback optimistic updates
            dispatch(deleteTaskOptimistic([tempId]));
            dispatch(
                updateSpaceTaskOrderOptimistic({
                    spaceId: task.space as string,
                    taskOrder: currentTaskOrder,
                })
            );
            console.error('Failed to add task:', error);
            showAlert('Failed to add task', 'error');
        }
    };

    return { addTask };
};
