import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Task } from '@/types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { useMoveSubtask } from '@/hooks/useMoveSubtask';

interface TaskListItemProps {
    task: Task;
    onClick: () => void;
    index: number;
    parentId: string | undefined;
}

const TaskListItem: React.FC<TaskListItemProps> = ({
    task,
    onClick,
    index,
    parentId,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const { moveSubtaskTemporary, commitSubtaskOrder } = useMoveSubtask();
    const ref = useRef<HTMLLIElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: 'TASK',
        item: { id: task._id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: 'TASK',
        hover: (item: { id: string; index: number }, monitor) => {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            // Time to actually perform the action
            if (parentId) {
                moveSubtaskTemporary(item.id, parentId, `after_${task._id}`);
            }

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
        drop: (item) => {
            if (parentId) {
                commitSubtaskOrder(parentId);
            }
        },
    });

    drag(drop(ref));

    return (
        <li
            ref={ref}
            onClick={onClick}
            className={`task-list-item p-4 ${
                isDragging ? 'opacity-50' : 'opacity-100'
            }`}
            style={{
                borderBottom: '1px solid #ccc',
                cursor: 'move',
            }}
        >
            {task.taskName}
        </li>
    );
};

export default TaskListItem;
