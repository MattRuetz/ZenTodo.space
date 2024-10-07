import { useDispatch } from 'react-redux';
import { AppDispatch, store } from '@/store/store';
import {
    addNewSubtaskOptimistic,
    addNewSubtaskAsync,
    updateTaskInPlace,
} from '@/store/tasksSlice';
import { Task } from '@/types';
import { generateTempId } from '@/app/utils/utils';
import { useAlert } from './useAlert';
import { adjustUserStats } from '@/store/userSlice';

export const useAddNewSubtask = () => {
    const dispatch = useDispatch<AppDispatch>();

    const { showAlert } = useAlert();

    const canAddSubtask = (parentTask: Task | null): boolean => {
        if (!parentTask) return false;
        if (!parentTask.ancestors) return true;
        return parentTask.ancestors.length < 2;
    };

    const addNewSubtask = async ({
        subtask,
        parentId,
        position,
    }: {
        // subtask: Omit<Task, '_id'>;
        subtask: Task;
        parentId?: string;
        position: string;
    }) => {
        const parentTask = store
            .getState()
            .tasks.tasks.find((task: Task) => task._id === parentId);

        if (!canAddSubtask(parentTask as Task)) {
            showAlert(
                'Task cannot be made a subtask because it would exceed the maximum depth of 2.',
                'error'
            );
            return;
        }

        // **Task limit check**
        const tasksInSpace = store
            .getState()
            .tasks.tasks.filter((t: Task) => t.space === subtask.space);

        if (tasksInSpace.length >= 50) {
            showAlert(
                'Task limit reached. You cannot create more than 50 tasks in this space.',
                'notice'
            );
            return;
        }

        const tempId = generateTempId();
        const tempSubtask: Task = {
            ...subtask,
            _id: tempId,
            isTemp: true,
            subtasks: [],
            ancestors: parentTask?.ancestors
                ? [...parentTask.ancestors, parentTask._id as string]
                : [parentTask?._id as string],
            parentTask: parentId,
            clientId: tempId,
        };
        // Dispatch optimistic update
        // Disabled because could not figure out how to update without a rerender
        // dispatch(
        //     addNewSubtaskOptimistic({
        //         newSubtask: tempSubtask,
        //         parentId,
        //         position,
        //     })
        // );

        try {
            // Attempt to add subtask in the backend
            const result = await dispatch(
                addNewSubtaskAsync({
                    subtask,
                    parentTask: parentTask as Task,
                    position,
                    tempId,
                })
            ).unwrap();

            // Update user stats
            dispatch(
                adjustUserStats({
                    totalTasksCreated: 1,
                })
            );

            // Success
            showAlert('Added subtask!', 'success');
        } catch (error) {
            // Error: rollback optimistic updates -- handled in the .rejected case in taskSlice extra reducers
            console.error('Failed to add subtask:', error);
            showAlert('Failed to add subtask', 'error');
        }
    };

    return { addNewSubtask };
};
