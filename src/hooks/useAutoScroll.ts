import { useEffect, useRef } from 'react';

export const useAutoScroll = (
    scrollRef: React.RefObject<HTMLElement>,
    isDragging: boolean,
    currentOffset: { x: number; y: number } | null
) => {
    const scrollIntervalRef = useRef<number | null>(null);
    const scrollSpeed = 10; // Increase scroll speed for smoother scrolling
    const scrollThreshold = 100; // pixels from top/bottom to trigger scroll

    useEffect(() => {
        if (!isDragging || !currentOffset || !scrollRef.current) {
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
            }
            return;
        }

        const scrollContainer = scrollRef.current;
        const containerRect = scrollContainer.getBoundingClientRect();

        const handleScroll = () => {
            const { y } = currentOffset;

            if (y - containerRect.top < scrollThreshold) {
                scrollContainer.scrollTop -= scrollSpeed; // Scroll up
            } else if (containerRect.bottom - y < scrollThreshold) {
                scrollContainer.scrollTop += scrollSpeed; // Scroll down
            }
        };

        const animateScroll = () => {
            handleScroll();
            scrollIntervalRef.current = requestAnimationFrame(animateScroll);
        };

        scrollIntervalRef.current = requestAnimationFrame(animateScroll);

        return () => {
            if (scrollIntervalRef.current) {
                cancelAnimationFrame(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
            }
        };
    }, [isDragging, currentOffset, scrollRef]);
};
