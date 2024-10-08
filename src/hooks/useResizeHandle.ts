import { AppDispatch, RootState } from '@/store/store';
import { updateTask, updateTaskOptimistic } from '@/store/tasksSlice';
import { createSelector } from '@reduxjs/toolkit';
import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface UseResizeHandleProps {
    cardRef: React.RefObject<HTMLDivElement>;
    setCardSize: (size: { width: number; height: number }) => void;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    taskId: string;
}

const selectTaskFromState = createSelector(
    (state: RootState) => state.tasks.tasks,
    (state: RootState, taskId: string) => taskId,
    (tasks, taskId) => tasks.find((task) => task._id === taskId)
);

export const useResizeHandle = ({
    cardRef,
    setCardSize,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    taskId,
}: UseResizeHandleProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isResizing, setIsResizing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = useState({ width: 0, height: 0 });

    const handleResizeStart = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(true);
            setStartPos({ x: e.clientX, y: e.clientY });
            setStartSize({
                width: cardRef.current?.offsetWidth || 0,
                height: cardRef.current?.offsetHeight || 0,
            });
        },
        [cardRef]
    );

    const handleResize = useCallback(
        (e: MouseEvent) => {
            if (!isResizing) return;

            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;

            const newWidth = Math.min(
                Math.max(startSize.width + dx, minWidth),
                maxWidth
            );
            const newHeight = Math.min(
                Math.max(startSize.height + dy, minHeight),
                maxHeight
            );

            // Update the card size using absolute positioning
            if (cardRef.current) {
                cardRef.current.style.width = `${newWidth}px`;
                cardRef.current.style.height = `${newHeight}px`;
            }

            // Call setCardSize to update the state (this won't cause immediate rerender)
            setCardSize({ width: newWidth, height: newHeight });
        },
        [
            isResizing,
            startPos,
            startSize,
            setCardSize,
            minWidth,
            maxWidth,
            minHeight,
            maxHeight,
            cardRef,
        ]
    );

    const handleResizeEnd = useCallback(() => {
        if (taskId) {
            dispatch(
                updateTask({
                    _id: taskId,
                    width: cardRef.current?.offsetWidth || 0,
                    height: cardRef.current?.offsetHeight || 0,
                })
            );
        }
        setIsResizing(false);
    }, [taskId, cardRef.current?.offsetWidth, cardRef.current?.offsetHeight]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleResize);
            window.addEventListener('mouseup', handleResizeEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [isResizing, handleResize, handleResizeEnd]);

    return { handleResizeStart, isResizing };
};
