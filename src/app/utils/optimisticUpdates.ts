import { Task } from '@/types';
import { generateTempId } from '@/app/utils/utils';

// This returns a map of task w/ taskId and all its descendants with their DB ids as keys
export const fetchAllTasks = async (
    taskId: string
): Promise<Map<string, Task>> => {
    const taskMap = new Map<string, Task>();

    const fetchTask = async (id: string) => {
        if (taskMap.has(id)) return taskMap.get(id);

        const response = await fetch(`/api/tasks/${id}`);
        const task: Task = await response.json();
        taskMap.set(id, task);

        if (task.subtasks && task.subtasks.length > 0) {
            for (const subtaskId of task.subtasks) {
                await fetchTask(subtaskId as string);
            }
        }

        return task;
    };

    await fetchTask(taskId);
    return taskMap;
};

// This is an optimistic update to allow for duplicate
// task creation without waiting for the server response
export const duplicateTaskWithTempIds = (
    task: Task,
    taskMap: Map<string, Task>,
    parentTempId?: string,
    parentAncestors: string[] = []
): { duplicatedTasks: Task[] } => {
    const tempId = generateTempId();
    const duplicatedTask: Task = {
        ...task,
        x: task.x + 100,
        y: task.y + 100,
        zIndex: task.zIndex + 3,
        _id: tempId,
        taskName: `(Copy) ${task.taskName}`,
        isTemp: true,
        parentTask: parentTempId,
        subtasks: [],
        ancestors: parentTempId ? [...parentAncestors, parentTempId] : [],
    };

    let duplicatedTasks = [duplicatedTask];

    if (task.subtasks && task.subtasks.length > 0) {
        for (const subtaskId of task.subtasks) {
            let subtaskObject: Task | undefined;

            if (typeof subtaskId === 'string') {
                subtaskObject = taskMap.get(subtaskId);
            } else if (typeof subtaskId === 'object') {
                subtaskObject = subtaskId;
            }
            if (!subtaskObject) continue; // Skip if subtask is not loaded

            const { duplicatedTasks: subDuplicatedTasks } =
                duplicateTaskWithTempIds(subtaskObject, taskMap, tempId, [
                    ...(duplicatedTask.ancestors || []),
                ]);

            // Only add the first element of subDuplicatedTasks to the subtasks array
            duplicatedTask.subtasks.push(subDuplicatedTasks[0]);
            duplicatedTasks = [...duplicatedTasks, ...subDuplicatedTasks];
        }
    }

    return { duplicatedTasks };
};
