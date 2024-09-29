import React from 'react';
import { useDragLayer } from 'react-dnd';
import { useTheme } from '@/hooks/useTheme';

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

    if (!isDragging || !currentOffset) {
        return null;
    }

    const { x, y } = currentOffset;

    const layerStyles: React.CSSProperties = {
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 1000,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
    };

    const itemStyles: React.CSSProperties = {
        position: 'absolute',
        left: x,
        top: y,
        opacity: 0.8,
        backgroundColor: `var(--${currentTheme}-background-100)`,
        color: `var(--${currentTheme}-text-default)`,
        padding: '8px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        maxWidth: '200px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    };

    return (
        <div style={layerStyles}>
            <div style={itemStyles}>{item.taskName || 'Untitled Task'}</div>
        </div>
    );
};

export default CustomDragLayer;
