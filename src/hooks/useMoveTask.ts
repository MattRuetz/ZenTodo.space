import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
    moveTaskWithinLevelOptimistic,
    moveTaskWithinLevelAsync,
} from '@/store/tasksSlice';
import {
    updateSpaceTaskOrderOptimistic,
    updateSpaceTaskOrderAsync,
} from '@/store/spaceSlice';
import { useCallback } from 'react';
import { useAlert } from '@/hooks/useAlert';
import { store } from '@/store/store';

export const useMoveTask = () => {
    const dispatch = useDispatch<AppDispatch>();
    const tasksState = useSelector((state: RootState) => state.tasks.tasks);
    const currentSpace = useSelector(
        (state: RootState) => state.spaces.currentSpace
    );
    const { showAlert } = useAlert();

    const moveTaskTemporary = useCallback(
        (taskId: string, parentId: string | null, newPosition: string) => {
            const spaceId = currentSpace?._id || '';

            let tasks: string[];
            if (parentId) {
                // For subtasks, use the parent task's subtasks array
                tasks =
                    tasksState.find((task) => task._id === parentId)
                        ?.subtasks || [];
            } else {
                // For root-level tasks, use the space's taskOrder
                tasks = currentSpace?.taskOrder || [];
            }

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

            if (parentId === null) {
                console.log('newOrder', newTasks);

                dispatch(
                    updateSpaceTaskOrderOptimistic({
                        taskOrder: newTasks as string[],
                        spaceId,
                    })
                );
            } else {
                dispatch(
                    moveTaskWithinLevelOptimistic({
                        parentId,
                        newTaskOrder: newTasks as string[],
                        spaceId,
                    })
                );
            }
        },
        [tasksState, currentSpace, dispatch, showAlert]
    );

    const commitTaskOrder = useCallback(
        async (parentId: string | null) => {
            const state = store.getState() as RootState; // Get the latest state

            const currentSpace = state.spaces.currentSpace;
            const spaceId = currentSpace?._id || '';

            const tasks = state.tasks.tasks;

            let tasksAtLevel: string[];
            if (parentId === null) {
                // For root-level tasks, use the current space's taskOrder
                tasksAtLevel = currentSpace?.taskOrder || [];
            } else {
                // For subtasks, use the parent task's subtasks array
                const parentTask = tasks.find((task) => task._id === parentId);
                tasksAtLevel = parentTask?.subtasks || [];
            }

            try {
                if (parentId === null) {
                    await dispatch(
                        updateSpaceTaskOrderAsync({
                            spaceId,
                            taskOrder: tasksAtLevel,
                        })
                    ).unwrap();
                } else {
                    await dispatch(
                        moveTaskWithinLevelAsync({
                            parentId,
                            newOrder: tasksAtLevel,
                            spaceId,
                        })
                    ).unwrap();
                }
            } catch (error) {
                console.error('Failed to commit task order:', error);
                showAlert('Failed to commit change order', 'error');
            }
        },
        [dispatch, showAlert]
    );

    return { moveTaskTemporary, commitTaskOrder };
};
