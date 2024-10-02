// src/hooks/useArchiveTask.ts

import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { archiveTaskAsync } from '@/store/tasksSlice';
import { Task } from '@/types';
import { useAlert } from '@/hooks/useAlert';

export const useArchiveTask = () => {
    const dispatch = useDispatch();
    const tasks = useSelector((state: RootState) => state.tasks.tasks);
    const { showAlert } = useAlert();

    const checkDescendantsComplete = useCallback(
        (taskId: string): boolean => {
            const task = tasks.find((t) => t._id === taskId);
            if (!task) return true;
            if (task.progress !== 'Complete') return false;
            return task.subtasks.every((subtaskId) =>
                checkDescendantsComplete(subtaskId)
            );
        },
        [tasks]
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

            dispatch(
                archiveTaskAsync({
                    taskId: task._id,
                    parentTaskId: task.parentTask,
                }) as any
            );
        },
        [checkDescendantsComplete, dispatch, showAlert]
    );

    return archiveTask;
};
