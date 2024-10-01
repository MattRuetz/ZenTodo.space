import React, { useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { useTheme } from '@/hooks/useTheme';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useMoveTask } from '@/hooks/useMoveTask';

interface TaskListDropZoneProps {
    position: string;
    parentId: string | null;
}

const TaskListDropZone: React.FC<TaskListDropZoneProps> = ({
    position,
    parentId,
}) => {
    const currentTheme = useTheme();
    const dropRef = useRef<HTMLDivElement>(null);
    const { moveTaskTemporary, commitTaskOrder } = useMoveTask();
    const sortOption = useSelector((state: RootState) => state.ui.sortOption);

    const handleHover = useCallback(
        (item: { id: string }, monitor: any) => {
            if (sortOption === 'custom') {
                if (!position.includes(item.id)) {
                    console.log('moving task', item.id, parentId, position);
                    moveTaskTemporary(item.id, parentId, position);
                }
            }
        },
        [parentId, position, sortOption, moveTaskTemporary]
    );

    const [{ isOver }, drop] = useDrop({
        accept: 'TASK',
        hover: handleHover,
        drop: (item: { id: string }) => {
            commitTaskOrder(parentId);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    });

    drop(dropRef);

    return (
        <div
            id={`dropzone-${position}`}
            ref={dropRef}
            className="task-list-dropzone"
            style={{
                height: '0.5rem',
                transition: 'background-color 0.3s ease',
            }}
        ></div>
    );
};

export default React.memo(TaskListDropZone);
