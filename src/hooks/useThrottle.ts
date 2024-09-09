import { useCallback, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => void>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<number | null>(null);
    const lastCalledRef = useRef<number>(0);

    return useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();

            if (now - lastCalledRef.current >= delay) {
                lastCalledRef.current = now;
                callback(...args);
            } else {
                if (timeoutRef.current !== null) {
                    cancelAnimationFrame(timeoutRef.current);
                }

                timeoutRef.current = requestAnimationFrame(() => {
                    lastCalledRef.current = now;
                    callback(...args);
                });
            }
        },
        [callback, delay]
    ) as T;
}
