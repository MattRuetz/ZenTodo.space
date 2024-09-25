import { useState, useEffect, useRef } from 'react';
import { Task } from '@/types';

export const useFadeOutEffect = (
    task: Task,
    isHovering: boolean,
    isFocused: boolean,
    onDelete: (taskId: string) => void
) => {
    const [shouldDelete, setShouldDelete] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const shouldFadeOut =
            !isHovering &&
            !isFocused &&
            !task.emoji &&
            !task.taskName &&
            !task.taskDescription &&
            task.subtasks.length === 0;

        if (shouldFadeOut) {
            // Start a timer for 4 seconds (3 seconds delay + 1 second fade out)
            timerRef.current = setTimeout(() => {
                setShouldDelete(true);
            }, 4000);
        } else {
            // Clear the timer if conditions change
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            setShouldDelete(false);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [
        isHovering,
        isFocused,
        task.taskName,
        task.taskDescription,
        task.emoji,
        task.subtasks.length,
    ]);

    useEffect(() => {
        if (shouldDelete) {
            // Trigger the delete after the exit animation completes
            const deleteTimer = setTimeout(() => {
                onDelete(task._id ?? '');
            }, 300); // Adjust this to match your exit animation duration

            return () => clearTimeout(deleteTimer);
        }
    }, [shouldDelete, onDelete, task._id]);

    return shouldDelete;
};
