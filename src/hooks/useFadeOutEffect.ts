import { useEffect, useRef } from 'react';
import { Task } from '@/types';

export const useFadeOutEffect = (
    task: Task,
    isHovering: boolean,
    isFocused: boolean,
    onDelete: (taskId: string) => void
) => {
    const opacityRef = useRef(1);
    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>();

    useEffect(() => {
        const shouldFadeOut =
            !isHovering &&
            !isFocused &&
            !task.taskName &&
            !task.taskDescription;

        const animate = (time: number) => {
            if (startTimeRef.current === undefined) {
                startTimeRef.current = time;
            }
            const elapsed = time - startTimeRef.current;

            if (elapsed > 3000) {
                // Start fading after 3 seconds
                opacityRef.current = Math.max(1 - (elapsed - 3000) / 1000, 0);

                if (opacityRef.current <= 0) {
                    onDelete(task._id ?? '');
                    return;
                }
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        if (shouldFadeOut) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            opacityRef.current = 1;
            startTimeRef.current = undefined;
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [
        isHovering,
        isFocused,
        task.taskName,
        task.taskDescription,
        task._id,
        onDelete,
    ]);

    return opacityRef.current;
};
