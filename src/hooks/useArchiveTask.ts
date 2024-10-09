// src/hooks/useArchiveTask.ts

import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { archiveTaskAsync } from '@/store/tasksSlice';
import { SpaceData, Task } from '@/types';
import { useAlert } from '@/hooks/useAlert';
import { updateSpaceTaskOrderAsync } from '@/store/spaceSlice';

export const useArchiveTask = ({
    tasksState,
    spacesState,
}: {
    tasksState: Task[];
    spacesState: SpaceData[];
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const { showAlert } = useAlert();
    const checkDescendantsComplete = useCallback(
        (taskId: string): boolean => {
            const task = tasksState.find((t) => t._id === taskId);
            if (!task) return true;
            if (task.progress !== 'Complete') return false;
            return task.subtasks.every((subtaskId) =>
                checkDescendantsComplete(subtaskId)
            );
        },
        [tasksState]
    );

    const archiveTask = useCallback(
        (task: Task) => {
            if (!task._id) {
                showAlert(
                    'Cannot archive task: Task ID is undefined.',
                    'error'
                );
                return;
            }
            if (!checkDescendantsComplete(task._id)) {
                showAlert(
                    'Cannot archive task: Some subtasks are not complete.',
                    'error'
                );
                return;
            }

            // Remove task and its descendants from the taskOrder array

            if (task.space) {
                const oldTaskOrder = spacesState.find(
                    (s) => s._id === task.space
                )?.taskOrder;
                console.log('oldTaskOrder', oldTaskOrder);
                const newTaskOrder = oldTaskOrder?.filter(
                    (id) => id !== task._id
                );
                console.log('newTaskOrder', newTaskOrder);

                dispatch(
                    updateSpaceTaskOrderAsync({
                        spaceId: task.space as string,
                        taskOrder: newTaskOrder as string[],
                    })
                );
            }

            dispatch(
                archiveTaskAsync({
                    taskId: task._id,
                    parentTaskId: task.parentTask,
                }) as any
            ).then(() => {
                showAlert('Task and all descendants archived', 'success');
            });
        },
        [checkDescendantsComplete, dispatch, showAlert]
    );

    return archiveTask;
};
