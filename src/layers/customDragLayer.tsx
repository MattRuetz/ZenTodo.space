import React from 'react';
import { useDragLayer } from 'react-dnd';
import { useTheme } from '@/hooks/useTheme';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Task } from '@/types';
import { Icon } from '@/components/Icon';
import { FaGripVertical } from 'react-icons/fa';
import { FaArrowsUpDownLeftRight } from 'react-icons/fa6';

const CustomDragLayer = () => {
    const currentTheme = useTheme();
    const { itemType, isDragging, item, currentOffset } = useDragLayer(
        (monitor) => ({
            itemType: monitor.getItemType(),
            isDragging: monitor.isDragging(),
            item: monitor.getItem(),
            currentOffset: monitor.getClientOffset(),
        })
    );

    // if (itemType !== 'TASK') {
    //     // SUBTASK and SPACE_CARD are also draggabled in this app
    //     return null;
    // }

    console.log(itemType);

    if (!isDragging || !currentOffset) {
        return null;
    }

    const { x, y } = currentOffset;

    const layerStyles: React.CSSProperties = {
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 10001,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
    };

    const itemStyles: React.CSSProperties = {
        position: 'absolute',
        left: x - 50,
        top: y - 50,
        opacity: 0.8,
        backgroundColor: `var(--${currentTheme}-emphasis-light)`,
        color: `var(--${currentTheme}-emphasis-dark)`,
        padding: '8px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        maxWidth: '200px',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    };

    return (
        <div style={layerStyles}>
            <div style={itemStyles}>
                <div className="flex items-center gap-1">
                    <div className="flex flex-row items-center gap-1">
                        <FaArrowsUpDownLeftRight />
                        {itemType === 'TASK' && (
                            <div className="truncate">
                                {item.task.taskName || 'Untitled Task'}
                            </div>
                        )}
                        {itemType === 'SPACE_CARD' && (
                            <div className="truncate">
                                {item.spaceCard.name || 'Untitled Space Card'}
                            </div>
                        )}
                    </div>
                    {itemType === 'TASK' && item.task.emoji && (
                        <div
                            className="absolute text-sm -right-4 -top-4 p-1 rounded-full"
                            style={{
                                backgroundColor: `var(--${currentTheme}-emphasis-light)`,
                                border: `1px solid var(--${currentTheme}-emphasis-dark)`,
                            }}
                        >
                            {item.task.emoji}
                        </div>
                    )}
                    {itemType === 'SPACE_CARD' && item.spaceCard.emoji && (
                        <div
                            className="absolute text-sm -right-4 -top-4 p-1 rounded-full"
                            style={{
                                backgroundColor: `var(--${currentTheme}-emphasis-light)`,
                                border: `1px solid var(--${currentTheme}-emphasis-dark)`,
                            }}
                        >
                            {item.spaceCard.emoji}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomDragLayer;
