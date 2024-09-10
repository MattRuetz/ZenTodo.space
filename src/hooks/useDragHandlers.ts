import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
    updateTask,
    deleteTask,
    addChildTask,
    hideNewChildTask,
} from '../store/tasksSlice';
import { AppDispatch } from '../store/store';
import debounce from 'lodash.debounce';
import { setGlobalDragging, setDraggingCardId } from '../store/uiSlice';
import { Task, TaskProgress } from '@/types';

interface UseDragHandlersProps {
    task: Task;
    currentTask: Task | undefined;
    localTask: Task;
    setLocalTask: (task: Task) => void;
    setCardSize: (size: { width: number; height: number }) => void;
    onDragStart: () => void;
    onDragStop: () => void;
    getNewZIndex: () => number;
}

export const useDragHandlers = ({
    task,
    currentTask,
    localTask,
    setLocalTask,
    setCardSize,
    onDragStart,
    onDragStop,
    getNewZIndex,
}: UseDragHandlersProps) => {
    const dispatch = useDispatch<AppDispatch>();

    const updateTaskInStore = useCallback(
        (updatedFields: Partial<Task>) => {
            if (task._id) {
                dispatch(updateTask({ _id: task._id, ...updatedFields }));
            }
        },
        [dispatch, task._id]
    );

    const debouncedUpdate = useCallback(debounce(updateTaskInStore, 500), [
        updateTaskInStore,
    ]);

    const handleDragStart = useCallback(
        (e: DraggableEvent, data: DraggableData) => {
            const newZIndex = getNewZIndex();
            dispatch(setGlobalDragging(true));
            dispatch(setDraggingCardId(task._id ?? ''));
            onDragStart();
        },
        [getNewZIndex, onDragStart, dispatch, task._id]
    );

    const handleDragStop = useCallback(
        (e: DraggableEvent, data: DraggableData) => {
            dispatch(setGlobalDragging(false));
            dispatch(setDraggingCardId(null));
            onDragStop();

            const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
            const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
            const elementsUnderCursor = document.elementsFromPoint(
                clientX,
                clientY
            );
            const cardsUnderCursor = elementsUnderCursor.filter((el) =>
                el.classList.contains('task-card')
            );
            const droppedOnCard = cardsUnderCursor[1];
            if (droppedOnCard && droppedOnCard !== e.target) {
                console.log('Dropped card ID:', task._id);
                console.log(
                    'Target card ID:',
                    droppedOnCard.getAttribute('data-task-id')
                );
                pushChildTask(
                    task,
                    droppedOnCard.getAttribute('data-task-id') ?? ''
                );
            }
        },
        [dispatch, onDragStop, task._id]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setLocalTask((prevTask) => ({ ...prevTask, [name]: value }));
        },
        [setLocalTask]
    );

    const handleInputBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setLocalTask((prevTask) => {
                const newTask = { ...prevTask, [name]: value };
                debouncedUpdate(newTask);
                return newTask;
            });
        },
        [debouncedUpdate, setLocalTask]
    );

    const handleProgressChange = useCallback(
        (newProgress: TaskProgress) => {
            setLocalTask((prevTask) => {
                const newTask = { ...prevTask, progress: newProgress };
                debouncedUpdate(newTask);
                return newTask;
            });
        },
        [debouncedUpdate, setLocalTask]
    );

    const handleDelete = useCallback(
        async (taskId: string) => {
            await dispatch(deleteTask(taskId));
        },
        [dispatch]
    );

    const handleCardClick = useCallback(() => {
        const newZIndex = getNewZIndex();
        setLocalTask((prevTask) => {
            const updatedTask = { ...prevTask, zIndex: newZIndex };
            return updatedTask;
        });
    }, [getNewZIndex, setLocalTask]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const isRightEdge = e.clientX > rect.right - 10;
            const isBottomEdge = e.clientY > rect.bottom - 10;
            if (isRightEdge || isBottomEdge) {
                resizingRef.current = true;
                startPosRef.current = { x: e.clientX, y: e.clientY };
                startSizeRef.current = {
                    width: rect.width,
                    height: rect.height,
                };
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }, []);

    return {
        handleDragStart,
        handleDragStop,
        handleInputChange,
        handleInputBlur,
        handleProgressChange,
        handleDelete,
        handleCardClick,
        handleMouseDown,
    };
};
