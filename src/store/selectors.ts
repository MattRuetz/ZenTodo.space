import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';
import { Task } from '@/types';

// Memoized selector for spaces
export const selectTasksForSpace = createSelector(
    [
        (state: RootState) => state.tasks.tasks,
        (state: RootState) => state.spaces.currentSpace,
        (state: RootState, spaceId: string) => spaceId,
    ],
    (tasks, currentSpace, spaceId) => {
        const selectedEmojis = currentSpace?.selectedEmojis || [];
        const tasksInSpace = tasks.filter(
            (task) =>
                task.space === spaceId &&
                !task.parentTask &&
                (selectedEmojis.length === 0 ||
                    selectedEmojis.includes(task.emoji || ''))
        );

        // return tasksInSpace;
        return tasksInSpace.map((task) => ({
            ...task,
            subtasks: tasks
                .filter((subtask) => subtask.parentTask === task._id)
                .map((subtask) => subtask._id), // Only include the IDs
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
                    tasks.find((t) => t._id === (subtask as string))
                )
                .filter((t): t is Task => t !== undefined) || [];

        return subtasks;
    }
);

// Selector to get tasks by their IDs
export const selectTasksByIds = createSelector(
    [
        (state: RootState) => state.tasks.tasks,
        (state: RootState, taskIds: string[]) => taskIds,
    ],
    (tasks, taskIds) => {
        return taskIds
            .map((id) => tasks.find((task) => task._id === id))
            .filter((task): task is Task => task !== undefined);
    }
);
