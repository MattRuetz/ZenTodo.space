import { useDispatch } from 'react-redux';
import { AppDispatch, store } from '@/store/store';
import {
    addNewSubtaskOptimistic,
    addNewSubtaskAsync,
} from '@/store/tasksSlice';
import { Task } from '@/types';
import { generateTempId } from '@/app/utils/utils';
import { useAlert } from './useAlert';

export const useAddNewSubtask = () => {
    const dispatch = useDispatch<AppDispatch>();

    const { showAlert } = useAlert();

    const canAddSubtask = (parentTask: Task | null): boolean => {
        console.log('parentTask', parentTask);
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
            console.error('Cannot add subtask: ancestors limit reached');
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
        };
        // Dispatch optimistic update
        dispatch(
            addNewSubtaskOptimistic({
                newSubtask: tempSubtask,
                parentId,
                position,
            })
        );

        try {
            // Attempt to add subtask in the backend
            await dispatch(
                addNewSubtaskAsync({
                    subtask,
                    parentTask: parentTask as Task,
                    position,
                    tempId,
                })
            ).unwrap();
            // Success: The new subtask with a real ID is added in the fulfilled case
            showAlert('Added subtask!', 'success');
        } catch (error) {
            // Error: rollback optimistic updates -- handled in the .rejected case in taskSlice extra reducers
            console.error('Failed to add subtask:', error);
        }
    };

    return { addNewSubtask };
};
