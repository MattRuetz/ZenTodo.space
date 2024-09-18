import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
    convertTaskToSubtaskOptimistic,
    convertTaskToSubtaskAsync,
    convertSubtaskToTaskOptimistic,
    convertSubtaskToTaskAsync,
} from '@/store/tasksSlice';
import { Task } from '@/types';
import { fetchAllTasksFromState } from '@/app/utils/optimisticUpdates';

export const useChangeHierarchy = () => {
    const dispatch = useDispatch<AppDispatch>();
    const tasksState = useSelector((state: RootState) => state.tasks.tasks);

    const convertTaskToSubtask = async (task: Task, parentTaskId: string) => {
        if (!task._id || !parentTaskId) {
            console.error('Task ID or parent task ID is undefined');
            return;
        }

        const taskMap = fetchAllTasksFromState(tasksState);

        const updatedTask: Task = {
            ...task,
            ancestors: [...(task.ancestors || []), parentTaskId],
            parentTask: parentTaskId,
            isTemp: true,
        };
        const updatedParentTask: Task = {
            ...(taskMap.get(parentTaskId) as Task),
            subtasks: [
                ...(taskMap.get(parentTaskId)?.subtasks || []),
                updatedTask._id as string,
            ],
            isTemp: true,
        };

        const grandparentTask = taskMap.get(
            updatedParentTask.parentTask as string
        );

        if (!updatedParentTask) {
            console.error('Parent task not found');
            return;
        }

        const updatedGrandparentTask: Task | undefined = grandparentTask
            ? {
                  ...grandparentTask,
                  subtasks: grandparentTask.subtasks.filter(
                      (id) => id !== updatedTask._id
                  ),
                  isTemp: true,
              }
            : undefined;

        const optimisticUpdate = {
            updatedTask,
            updatedParentTask,
            updatedGrandparentTask,
        };

        dispatch(convertTaskToSubtaskOptimistic(optimisticUpdate));

        try {
            const result = await dispatch(
                convertTaskToSubtaskAsync({
                    childTask: task,
                    parentTaskId,
                    oldParentTaskId: task.parentTask || null,
                })
            ).unwrap();

            if (result.error) {
                console.error(
                    'Failed to convert task to subtask:',
                    result.error
                );
                // You might want to show an error message to the user here
            }
        } catch (error) {
            console.error('Failed to convert task to subtask:', error);
            // You might want to show an error message to the user here
        }
    };
    const convertSubtaskToTask = async (
        subtask: Task,
        dropPosition: { x: number; y: number } | undefined
    ) => {
        if (!subtask._id || !subtask.parentTask) {
            console.error('Subtask ID or parent task ID is undefined');
            return;
        }

        const taskMap = fetchAllTasksFromState(tasksState);

        const parentTask = taskMap.get(subtask.parentTask as string);

        const grandparentTask = taskMap.get(parentTask?.parentTask as string);

        if (!parentTask) {
            console.error('Parent task not found');
            return;
        }

        const updatedSubtask: Task = {
            ...subtask,
            parentTask: undefined,
            ancestors: [
                ...(subtask.ancestors?.filter(
                    (id) => id !== parentTask._id && id !== grandparentTask?._id
                ) || []),
            ],
            x: dropPosition?.x || subtask.x,
            y: dropPosition?.y || subtask.y,
            isTemp: true,
        };

        const updatedParentTask: Task = {
            ...parentTask,
            subtasks: parentTask.subtasks.filter((id) => id !== subtask._id),
            isTemp: true,
        };

        const optimisticUpdate = {
            updatedSubtask,
            updatedParentTask,
        };

        dispatch(convertSubtaskToTaskOptimistic(optimisticUpdate));

        try {
            await dispatch(
                convertSubtaskToTaskAsync({ subtask, dropPosition })
            ).unwrap();
        } catch (error) {
            console.error('Failed to convert subtask to task:', error);
        }
    };

    return { convertTaskToSubtask, convertSubtaskToTask };
};
