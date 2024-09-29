import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, store } from '@/store/store';
import {
    moveTaskWithinLevelOptimistic,
    moveTaskWithinLevelAsync,
} from '@/store/tasksSlice';
import { useCallback } from 'react';
import { useAlert } from '@/hooks/useAlert';

export const useMoveTask = () => {
    const dispatch = useDispatch<AppDispatch>();
    const tasksState = useSelector((state: RootState) => state.tasks.tasks);
    const { showAlert } = useAlert();

    const moveTaskTemporary = useCallback(
        (taskId: string, parentId: string | null, newPosition: string) => {
            const tasks = parentId
                ? tasksState.find((task) => task._id === parentId)?.subtasks ||
                  []
                : tasksState
                      .filter((task) => !task.parentTask)
                      .map((task) => task._id);

            const currentIndex = tasks.indexOf(taskId);

            if (currentIndex === -1) {
                console.error('Task not found in current level');
                showAlert('Task not found in current level', 'error');
                return;
            }

            const newTasks = [...tasks];
            newTasks.splice(currentIndex, 1);

            if (newPosition === 'start') {
                newTasks.unshift(taskId);
            } else if (newPosition.startsWith('after_')) {
                const afterId = newPosition.split('_')[1];
                const afterIndex = newTasks.indexOf(afterId);
                if (afterIndex !== -1) {
                    newTasks.splice(afterIndex + 1, 0, taskId);
                } else {
                    newTasks.push(taskId);
                }
            } else {
                newTasks.push(taskId);
            }

            dispatch(
                moveTaskWithinLevelOptimistic({
                    parentId,
                    newTaskOrder: newTasks as string[],
                })
            );
        },
        [tasksState, dispatch, showAlert]
    );

    const commitTaskOrder = useCallback(
        async (parentId: string | null) => {
            const tasks = store.getState().tasks.tasks;
            const tasksAtLevel = parentId
                ? tasks.filter((task) => task.parentTask === parentId)
                : tasks.filter((task) => !task.parentTask);

            const taskIds = tasksAtLevel.map((task) => task._id);

            try {
                await dispatch(
                    moveTaskWithinLevelAsync({
                        parentId,
                        newOrder: taskIds as string[],
                    })
                ).unwrap();
            } catch (error) {
                console.error('Failed to commit task order:', error);
                showAlert('Failed to commit change order', 'error');
            }
        },
        [dispatch, showAlert]
    );

    return { moveTaskTemporary, commitTaskOrder };
};
