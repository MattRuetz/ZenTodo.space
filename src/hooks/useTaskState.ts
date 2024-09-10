import { useState, useRef } from 'react';
import { Task } from '@/types';

export const useTaskState = (task: Task) => {
    const [localTask, setLocalTask] = useState(task);
    const [isHovering, setIsHovering] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [cardSize, setCardSize] = useState({ width: 240, height: 200 });
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isDropped, setIsDropped] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);
    const taskNameRef = useRef<HTMLInputElement>(null);
    const taskDescriptionRef = useRef<HTMLTextAreaElement>(null);

    return {
        localTask,
        isHovering,
        isFocused,
        cardSize,
        isDraggingOver,
        isDropped,
        setLocalTask,
        setIsHovering,
        setIsFocused,
        setCardSize,
        setIsDraggingOver,
        setIsDropped,
        cardRef,
        taskNameRef,
        taskDescriptionRef,
    };
};
