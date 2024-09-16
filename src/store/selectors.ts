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
