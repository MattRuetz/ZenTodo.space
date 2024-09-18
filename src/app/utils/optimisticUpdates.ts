import { Task } from '@/types';
import { generateTempId } from '@/app/utils/utils';

export const fetchAllTasksFromState = (
    tasksState: Task[]
): Map<string, Task> => {
    const taskMap = new Map<string, Task>();

    for (const task of tasksState) {
        if (task._id) {
            taskMap.set(task._id, task);
        }
    }

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
        subtasks: [], // Initialize with an empty array
        ancestors: parentTempId ? [...parentAncestors, parentTempId] : [],
    };

    let duplicatedTasks = [duplicatedTask];

    console.log('task.subtasks', task.subtasks);

    if (task.subtasks && task.subtasks.length > 0) {
        for (const subtaskId of task.subtasks) {
            console.log('subtaskId', subtaskId);

            // WHAT IS THIS HELL
            const subtaskObject = taskMap.get(subtaskId);

            if (!subtaskObject) continue; // Skip if subtask is not loaded

            const { duplicatedTasks: subDuplicatedTasks } =
                duplicateTaskWithTempIds(subtaskObject, taskMap, tempId, [
                    ...(duplicatedTask.ancestors || []),
                ]);

            // Add the ID of the first duplicated subtask to the current task's subtasks array
            duplicatedTask.subtasks.push(subDuplicatedTasks[0]._id as string);

            // Add all duplicated subtasks to the overall duplicatedTasks array
            duplicatedTasks = [...duplicatedTasks, ...subDuplicatedTasks];
        }
    }

    return { duplicatedTasks };
};
