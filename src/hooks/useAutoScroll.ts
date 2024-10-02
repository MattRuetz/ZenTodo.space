import { useEffect, useRef } from 'react';
import { useIsMobile } from './useIsMobile';

export const useAutoScroll = (
    scrollRef: React.RefObject<HTMLElement>,
    isDragging: boolean,
    currentOffset: { x: number; y: number } | null
) => {
    const scrollIntervalRef = useRef<number | null>(null);
    const scrollSpeed = 10; // Base scroll speed
    const scrollThreshold = 200; // pixels from top/bottom to trigger scroll

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

            // Calculate how close the drag item is to the top or bottom
            const distanceToTop = y - containerRect.top;
            const distanceToBottom = containerRect.bottom - y;

            if (distanceToTop < scrollThreshold) {
                // Scroll up faster if closer to the top
                scrollContainer.scrollTop -=
                    (scrollSpeed * (scrollThreshold - distanceToTop)) /
                    scrollThreshold;
            } else if (distanceToBottom < scrollThreshold) {
                // Scroll down faster if closer to the bottom
                scrollContainer.scrollTop +=
                    (scrollSpeed * (scrollThreshold - distanceToBottom)) /
                    scrollThreshold;
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
