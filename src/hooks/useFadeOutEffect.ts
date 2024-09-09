import { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '@/types';

export const useFadeOutEffect = (
    task: Task,
    isHovering: boolean,
    isFocused: boolean,
    onDelete: (taskId: string) => void
) => {
    const [opacity, setOpacity] = useState(1);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimers = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    useEffect(() => {
        const shouldFadeOut =
            !isHovering &&
            !isFocused &&
            !task.taskName &&
            !task.taskDescription;

        if (shouldFadeOut) {
            timeoutRef.current = setTimeout(() => {
                intervalRef.current = setInterval(() => {
                    setOpacity((prevOpacity) => {
                        if (prevOpacity <= 0) {
                            clearTimers();
                            onDelete(task._id ?? '');
                            return 0;
                        }
                        return Math.max(prevOpacity - 0.1, 0);
                    });
                }, 100);
            }, 3000);
        } else {
            clearTimers();
            setOpacity(1);
        }

        return clearTimers;
    }, [
        isHovering,
        isFocused,
        task.taskName,
        task.taskDescription,
        task._id,
        onDelete,
        clearTimers,
    ]);

    return opacity;
};
