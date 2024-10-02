import { AppDispatch, RootState, store } from '@/store/store';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '@/store/tasksSlice';
import { deleteTaskOptimistic, deleteTaskAsync } from '@/store/tasksSlice';
import { Task } from '@/types';
import { useAlert } from '@/hooks/useAlert';
import {
    removeTaskFromTaskOrder,
    updateSpaceTaskOrderAsync,
} from '@/store/spaceSlice';

export const useDeleteTask = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { showAlert } = useAlert();
    const tasksState = useSelector((state: RootState) => state.tasks.tasks);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    const initiateDeleteTask = useCallback(
        (taskId: string) => {
            const task = tasksState.find((t) => t._id === taskId);
            if (task) {
                setTaskToDelete(task);
                if (task.subtasks.length > 0) {
                    setShowDeleteConfirm(true);
                } else {
                    performDeleteTask(task);
                }
            }
        },
        [tasksState]
    );

    const performDeleteTask = useCallback(
        async (task: Task) => {
            if (!task._id) return;

            const descendantTasks = getDescendantTasks(task, tasksState);
            const tasksToDelete = [task, ...descendantTasks];

            dispatch(
                deleteTaskOptimistic(tasksToDelete.map((t) => t._id as string))
            );

            // Remove the task from the space's taskOrder
            dispatch(
                removeTaskFromTaskOrder({
                    spaceId: task.space as string,
                    taskId: task._id,
                })
            );

            const parentTaskId = task.parentTask;
            try {
                await dispatch(
                    deleteTaskAsync({
                        taskId: task._id,
                        parentTaskId: parentTaskId || '',
                    })
                ).unwrap();

                // If the deletion was successful, update the space's taskOrder in the backend
                await dispatch(
                    updateSpaceTaskOrderAsync({
                        spaceId: task.space as string,
                        taskOrder:
                            store
                                .getState()
                                .spaces.spaces.find((s) => s._id === task.space)
                                ?.taskOrder || [],
                    })
                ).unwrap();
            } catch (error) {
                console.error('Failed to delete tasks:', error);
                dispatch(fetchTasks());
                showAlert('Failed to delete task', 'error');
            } finally {
                setShowDeleteConfirm(false);
                setTaskToDelete(null);
            }
        },
        [dispatch, tasksState, showAlert]
    );

    const cancelDelete = useCallback(() => {
        setShowDeleteConfirm(false);
        setTaskToDelete(null);
    }, []);

    return {
        initiateDeleteTask,
        performDeleteTask,
        cancelDelete,
        showDeleteConfirm,
        taskToDelete,
    };
};

const getDescendantTasks = (task: Task, allTasks: Task[]): Task[] => {
    let descendants: Task[] = [];
    for (const subtaskId of task.subtasks) {
        const subtask = allTasks.find((t) => t._id === subtaskId);
        if (subtask) {
            descendants.push(subtask);
            descendants = [
                ...descendants,
                ...getDescendantTasks(subtask, allTasks),
            ];
        }
    }
    return descendants;
};
