import { useState, useRef } from 'react';
import { Task } from '@/types';

export const useTaskState = (task: Task) => {
    const [localTask, setLocalTask] = useState(task);
    const [isHovering, setIsHovering] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [cardSize, setCardSize] = useState({
        width: task.width || 270,
        height: task.height || 250,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isDropped, setIsDropped] = useState(false);
    const [deletingTasks, setDeletingTasks] = useState<Set<string>>(new Set());
    const [showDetails, setShowDetails] = useState(false);
    const [allowDrop, setAllowDrop] = useState(false); // Add state for allowDrop

    const cardRef = useRef<HTMLDivElement>(null);
    const taskNameRef = useRef<HTMLInputElement>(null);
    const taskDescriptionRef = useRef<HTMLTextAreaElement>(null);
    const resizingRef = useRef<boolean>(false);
    const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const startSizeRef = useRef<{ width: number; height: number }>({
        width: 0,
        height: 0,
    });
    const isDraggingOverRef = useRef(false);
    const allowDropRef = useRef(false); // Use ref for allowDrop
    const isHoveringRef = useRef(false);

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
        setIsDragging,
        isDragging,
        cardRef,
        taskNameRef,
        taskDescriptionRef,
        resizingRef,
        startPosRef,
        startSizeRef,
        deletingTasks,
        setDeletingTasks,
        showDetails,
        setShowDetails,
        allowDropRef,
        allowDrop, // Return the state
        setAllowDrop, // Return the setter
        isDraggingOverRef,
        isHoveringRef,
    };
};
