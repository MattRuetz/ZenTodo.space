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
        const selectedProgresses = currentSpace?.selectedProgresses || [];
        const selectedDueDateRange = currentSpace?.selectedDueDateRange || null;

        const today = new Date();
        const next7Days = new Date(today);
        next7Days.setDate(today.getDate() + 7);
        const next30Days = new Date(today);
        next30Days.setDate(today.getDate() + 30);

        const tasksInSpace = tasks.filter(
            (task) =>
                task.space === spaceId &&
                !task.parentTask &&
                !task.isArchived &&
                (selectedEmojis.length === 0 ||
                    selectedEmojis.includes(task.emoji || '')) &&
                (selectedProgresses.length === 0 ||
                    selectedProgresses.includes(task.progress || '')) &&
                (selectedDueDateRange === null ||
                    isDateWithinRange(
                        task.dueDate ? new Date(task.dueDate) : null,
                        selectedDueDateRange
                    ))
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

// Helper - date is within range
const isDateWithinRange = (date: Date | null, range: string) => {
    if (!date) return false;
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);

    if (range === 'today') {
        return date.getTime() === today.getTime();
    } else if (range === 'next 7 days') {
        return (
            date.getTime() >= today.getTime() &&
            date.getTime() <= next7Days.getTime()
        );
    } else if (range === 'next 30 days') {
        return (
            date.getTime() >= today.getTime() &&
            date.getTime() <= next30Days.getTime()
        );
    }
    return false;
};
