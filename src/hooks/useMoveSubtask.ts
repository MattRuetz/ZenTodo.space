import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
    moveSubtaskWithinLevelOptimistic,
    moveSubtaskWithinLevel,
} from '@/store/tasksSlice';
import { Task } from '@/types';

export const useMoveSubtask = () => {
    const dispatch = useDispatch<AppDispatch>();
    const tasksState = useSelector((state: RootState) => state.tasks.tasks);

    const moveSubtask = async (
        subtaskId: string,
        parentId: string,
        newPosition: string
    ) => {
        const parentTask = tasksState.find((task) => task._id === parentId);
        const subtask = tasksState.find((task) => task._id === subtaskId);

        if (!parentTask || !subtask) {
            console.error('Parent task or subtask not found');
            return;
        }

        let newSubtasks = [...parentTask.subtasks];
        const currentIndex = newSubtasks.findIndex((id) => id === subtaskId);

        if (currentIndex === -1) {
            console.error('Subtask not found in parent task');
            return;
        }

        newSubtasks.splice(currentIndex, 1);

        if (newPosition === 'start') {
            newSubtasks.unshift(subtaskId);
        } else if (newPosition.startsWith('after_')) {
            const afterId = newPosition.split('_')[1];
            const afterIndex = newSubtasks.findIndex((id) => id === afterId);
            if (afterIndex !== -1) {
                newSubtasks.splice(afterIndex + 1, 0, subtaskId);
            } else {
                newSubtasks.push(subtaskId);
            }
        } else {
            newSubtasks.push(subtaskId);
        }

        const updatedParentTask: Task = {
            ...parentTask,
            subtasks: newSubtasks,
            isTemp: true,
        };

        const updatedSubtask: Task = {
            ...subtask,
            isTemp: true,
        };

        // Dispatch optimistic update
        dispatch(
            moveSubtaskWithinLevelOptimistic({
                updatedParentTask,
                updatedSubtask,
            })
        );

        try {
            // Attempt to move subtask in the backend
            await dispatch(
                moveSubtaskWithinLevel({ subtaskId, parentId, newPosition })
            ).unwrap();
            // Success: State is updated in the fulfilled case
        } catch (error) {
            // Error: rollback optimistic updates -- handled in the .rejected case in taskSlice extra reducers
            console.error('Failed to move subtask:', error);
        }
    };

    return { moveSubtask };
};
