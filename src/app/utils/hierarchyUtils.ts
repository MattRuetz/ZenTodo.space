import { Task } from '@/types';

export const getParentTask = (task: Task, allTasks: Task[]) => {
    if (!task.parentTask) return null;
    return allTasks.find((t) => t._id === task.parentTask);
};

export const getGrandparentTask = (task: Task, allTasks: Task[]) => {
    const parentTask = getParentTask(task, allTasks);
    if (!parentTask?.parentTask) return null;
    return allTasks.find((t) => t._id === parentTask?.parentTask);
};

export const isGrandparent = (task: Task, allTasks: Task[]): boolean => {
    const subtasks = allTasks.filter((t) => t.parentTask === task._id);
    for (const subtask of subtasks) {
        const hasSubtasks = allTasks.some((t) => t.parentTask === subtask._id);
        if (hasSubtasks) {
            return true;
        }
    }
    return false;
};
