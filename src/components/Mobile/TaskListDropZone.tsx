// src/components/Mobile/TaskListDropZone.tsx
import React, { useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useMoveTask } from '@/hooks/useMoveTask';
import { Task } from '@/types';

interface TaskListDropZoneProps {
    position: string;
    parentId: string | null;
}

const TaskListDropZone: React.FC<TaskListDropZoneProps> = React.memo(
    ({ position, parentId }) => {
        const dropRef = useRef<HTMLDivElement>(null);
        const { moveTaskTemporary, commitTaskOrder } = useMoveTask();
        const sortOption = useSelector(
            (state: RootState) => state.ui.sortOption
        );

        const handleHover = useCallback(
            (item: { task: Task }, monitor: any) => {
                if (
                    sortOption === 'custom' &&
                    !position.includes(item.task._id as string)
                ) {
                    moveTaskTemporary(
                        item.task._id as string,
                        parentId,
                        position
                    );
                }
            },
            [parentId, position, sortOption, moveTaskTemporary]
        );

        const [, drop] = useDrop({
            accept: 'TASK',
            hover: handleHover,
            drop: (item: { task: Task }) => {
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
    }
);

export default TaskListDropZone;
