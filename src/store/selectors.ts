import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';
import { Task } from '@/types';

// Memoized selector for spaces
export const selectTasksForSpace = createSelector(
    [
        (state: RootState) => state.tasks.tasks,
        (state: RootState, spaceId: string) => spaceId,
    ],
    (tasks, spaceId) => {
        const tasksInSpace = tasks.filter(
            (task) => task.space === spaceId && !task.parentTask
        );
        return tasksInSpace.map((task) => ({
            ...task,
            subtasks: tasks.filter(
                (subtask) => subtask.parentTask === task._id
            ),
        }));
    }
);

export const selectSubtasks = createSelector(
    [
        (state: RootState) => state.tasks.tasks,
        (state: RootState, task: Task) => task,
    ],
    (tasks, task) => {
        const subtasks =
            task?.subtasks
                ?.map((subtask) =>
                    tasks.find(
                        (t) => t._id === (subtask._id as unknown as string)
                    )
                )
                .filter((t): t is Task => t !== undefined) || [];

        return subtasks;
    }
);
