import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, store } from '@/store/store';
import {
    moveSubtaskWithinLevelOptimistic,
    moveSubtaskWithinLevelAsync,
} from '@/store/tasksSlice';
import { Task } from '@/types';
import { useCallback, useRef } from 'react';
import { useAlert } from '@/hooks/useAlert';

export const useMoveSubtask = () => {
    const dispatch = useDispatch<AppDispatch>();
    const tasksState = useSelector((state: RootState) => state.tasks.tasks);
    const { showAlert } = useAlert();

    const moveSubtaskTemporary = useCallback(
        (subtaskId: string, parentId: string, newPosition: string) => {
            const parentTask = tasksState.find((task) => task._id === parentId);
            if (!parentTask) {
                console.error('Parent task not found');
                showAlert('Parent task not found', 'error');
                return;
            }

            let newSubtasks = [...parentTask.subtasks];
            const currentIndex = newSubtasks.findIndex(
                (id) => id === subtaskId
            );

            if (currentIndex === -1) {
                console.error('Subtask not found in parent task');
                showAlert('Subtask not found in parent task', 'error');
                return;
            }

            newSubtasks.splice(currentIndex, 1);

            if (newPosition === 'start') {
                newSubtasks.unshift(subtaskId);
            } else if (newPosition.startsWith('after_')) {
                const afterId = newPosition.split('_')[1];
                const afterIndex = newSubtasks.findIndex(
                    (id) => id === afterId
                );
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

            dispatch(
                moveSubtaskWithinLevelOptimistic({
                    updatedParentTask,
                })
            );
        },
        [tasksState, dispatch]
    );

    const commitSubtaskOrder = useCallback(
        async (parentId: string) => {
            const state = store.getState(); // Get the latest state
            const parentTask = state.tasks.tasks.find(
                (task: Task) => task._id === parentId
            );
            if (!parentTask) {
                console.error('Parent task not found');
                showAlert('Parent task not found', 'error');
                return;
            }

            try {
                await dispatch(
                    moveSubtaskWithinLevelAsync({
                        subtaskId: '',
                        parentId,
                        newPosition: '',
                        newOrder: parentTask.subtasks,
                    })
                ).unwrap();
            } catch (error) {
                console.error('Failed to commit subtask order:', error);
                showAlert('Failed to commit change order', 'error');
            }
        },
        [dispatch] // Remove tasksState from dependencies
    );

    return { moveSubtaskTemporary, commitSubtaskOrder };
};
