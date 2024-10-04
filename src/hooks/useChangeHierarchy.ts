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
import { useAlert } from '@/hooks/useAlert';
import { updateSpaceTaskOrderAsync } from '@/store/spaceSlice';
import { isGrandparent } from '@/app/utils/hierarchyUtils';
import { store } from '@/store/store';

export const useChangeHierarchy = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { showAlert } = useAlert();
    const tasksState = useSelector((state: RootState) => state.tasks.tasks);
    const spaces = useSelector((state: RootState) => state.spaces.spaces);
    const { getState } = store;

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
            showAlert('Parent task not found', 'error');
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

        if (
            updatedTask.taskName.length === 0 ||
            updatedParentTask.taskName.length === 0
        ) {
            showAlert('Task name cannot be empty', 'error');
            return;
        }

        if (task.ancestors && task.ancestors.length >= 2) {
            showAlert(
                'Task cannot be made a subtask because it would exceed the maximum depth of 2.',
                'error'
            );
            return;
        }

        const taskSubtasks = taskMap.get(task._id)?.subtasks;
        const hasChildren = taskSubtasks && taskSubtasks.length > 0;
        if (task.parentTask && hasChildren) {
            showAlert(
                'Task cannot be made a subtask because it would exceed the maximum depth of 2.',
                'error'
            );
            return;
        }

        const hasGrandchildren = isGrandparent(task, tasksState);
        // const childTaskIds = taskMap.get(task._id)?.subtasks || [];
        // const hasGrandchildren = childTaskIds.some((childId) => {
        //     const childTask = taskMap.get(childId);
        //     return (
        //         childTask && childTask.subtasks && childTask.subtasks.length > 0
        //     );
        // });

        if (hasGrandchildren) {
            showAlert(
                'Task cannot be made a subtask because it already has grandchildren.',
                'error'
            );
            return;
        }

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
                showAlert(result.error, 'error');
            } else {
                const spaceId = result.updatedSubtask.space as string;
                // Fetch the latest space data from the store
                const latestSpaceState = getState().spaces.spaces;
                const space = latestSpaceState.find((s) => s._id === spaceId);

                if (space) {
                    const updatedTaskOrder = space.taskOrder.filter(
                        (id) => id !== task._id
                    );

                    await dispatch(
                        updateSpaceTaskOrderAsync({
                            spaceId,
                            taskOrder: updatedTaskOrder,
                        })
                    );
                }
            }
        } catch (error) {
            console.error('Failed to convert task to subtask:', error);
            showAlert('Failed to convert task to subtask', 'error');
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
            zIndex: subtask.zIndex,
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
            const result = await dispatch(
                convertSubtaskToTaskAsync({ subtask, dropPosition })
            ).unwrap();

            if (result.updatedSubtask) {
                const spaceId = result.updatedSubtask.space as string;
                // Fetch the latest space data from the store
                const latestSpaceState = getState().spaces.spaces;
                const space = latestSpaceState.find((s) => s._id === spaceId);

                if (space) {
                    // Check if the task ID is already in the taskOrder
                    if (
                        !space.taskOrder.includes(
                            result.updatedSubtask._id as string
                        )
                    ) {
                        const updatedTaskOrder = [
                            result.updatedSubtask._id as string,
                            ...space.taskOrder,
                        ];

                        await dispatch(
                            updateSpaceTaskOrderAsync({
                                spaceId,
                                taskOrder: updatedTaskOrder,
                            })
                        );
                    } else {
                        console.log(
                            'Task ID already exists in taskOrder, no update needed'
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Failed to convert subtask to task:', error);
            showAlert('Failed to convert subtask to task', 'error');
        }
    };

    return { convertTaskToSubtask, convertSubtaskToTask };
};
