import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
    addNewSubtaskOptimistic,
    addNewSubtaskAsync,
} from '@/store/tasksSlice';
import { Task } from '@/types';
import { generateTempId } from '@/app/utils/utils';

export const useAddNewSubtask = () => {
    const dispatch = useDispatch<AppDispatch>();

    const addNewSubtask = async ({
        subtask,
        parentId,
        position,
    }: {
        subtask: Omit<Task, '_id'>;
        parentId?: string;
        position: string;
    }) => {
        const tempId = generateTempId();
        const tempSubtask: Task = {
            ...subtask,
            _id: tempId,
            isTemp: true,
            subtasks: [],
            ancestors: parentId ? [parentId] : [],
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
                addNewSubtaskAsync({ subtask, parentId, position, tempId })
            ).unwrap();
            // Success: The new subtask with a real ID is added in the fulfilled case
        } catch (error) {
            // Error: rollback optimistic updates -- handled in the .rejected case in taskSlice extra reducers
            console.error('Failed to add subtask:', error);
        }
    };

    return { addNewSubtask };
};
