import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { setGlobalDragging, setDraggingCardId } from '../store/uiSlice';
import { Task } from '@/types';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { updateSpaceMaxZIndex } from '@/store/spaceSlice';
import { useAlert } from '@/hooks/useAlert';
import { updateTaskPositionOptimistic } from '@/store/tasksSlice';

interface UseDragHandlersProps {
    task: Task;
    localTask: Task;
    setLocalTask: (task: (prev: Task) => Task) => void;
    onDragStart: () => void;
    onDragStop: () => void;
    getNewZIndex: () => number;
    pushChildTask: (task: Task, parentId: string) => void;
    debouncedUpdate: (task: Partial<Task>) => void;
    setIsFocused: (isFocused: boolean) => void;
    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
    allowDropRef: React.MutableRefObject<boolean>;
    allowDrop: boolean;
    setAllowDrop: (allowDrop: boolean) => void;
}

export const useDragHandlers = ({
    task,
    setLocalTask,
    onDragStart,
    onDragStop,
    getNewZIndex,
    pushChildTask,
    debouncedUpdate,
    setIsFocused,
    isDragging,
    setIsDragging,
    allowDropRef,
    setAllowDrop,
}: UseDragHandlersProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { showAlert } = useAlert();

    const handleDragStart = useCallback(
        (e: DraggableEvent, data: DraggableData) => {
            let dragTimer: NodeJS.Timeout;

            const newZIndex = getNewZIndex();
            setLocalTask((prevTask) => ({
                ...prevTask,
                zIndex: newZIndex,
            }));

            dispatch(setGlobalDragging(true));
            dispatch(setDraggingCardId(task._id ?? ''));
            onDragStart();
            setIsDragging(true);

            dragTimer = setTimeout(() => {
                allowDropRef.current = true;
                setAllowDrop(true);
            }, 300);

            const cancelDrag = () => {
                clearTimeout(dragTimer);
            };
            document.addEventListener('mouseup', cancelDrag, { once: true });

            return cancelDrag;
        },
        [
            getNewZIndex,
            onDragStart,
            dispatch,
            task._id,
            setLocalTask,
            task.space,
            setIsDragging,
            allowDropRef,
            setAllowDrop,
        ]
    );

    const handleDragStop = useCallback(
        (e: DraggableEvent, data: DraggableData) => {
            const newZIndex = getNewZIndex();

            const result = dispatch(
                updateTaskPositionOptimistic({
                    taskId: task._id as string,
                    newPosition: {
                        x: data.x,
                        y: data.y,
                        zIndex: newZIndex,
                    },
                })
            );

            if (!isDragging) return;

            setLocalTask((prevTask: Task) => {
                const newTaskData = {
                    x: result.payload.newPosition.x,
                    y: result.payload.newPosition.y,
                    zIndex: newZIndex,
                };

                debouncedUpdate(newTaskData);
                return { ...prevTask, ...newTaskData };
            });

            if (!allowDropRef.current) {
                setIsDragging(false);
                onDragStop();
                dispatch(setGlobalDragging(false));
                dispatch(setDraggingCardId(null));
                return;
            }
            allowDropRef.current = false;
            setAllowDrop(false);
            setIsDragging(false);

            const spaceId = task.space;
            dispatch(
                updateSpaceMaxZIndex({
                    spaceId: spaceId as string,
                    maxZIndex: newZIndex,
                })
            );
            dispatch(setGlobalDragging(false));
            dispatch(setDraggingCardId(null));
            onDragStop();
            const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
            const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
            const elementsUnderCursor = document.elementsFromPoint(
                clientX,
                clientY
            );
            const subtaskDrawerUnderCursor = elementsUnderCursor.filter((el) =>
                el.classList.contains('subtask-drawer')
            );
            if (subtaskDrawerUnderCursor.length > 0) {
                const subtaskDrawer = subtaskDrawerUnderCursor[0];
                const parentId = subtaskDrawer.getAttribute(
                    'data-drawer-parent-id'
                );
                if (parentId) {
                    if (parentId === task._id) {
                        // Dont allow a task to be dragged into its own drawer
                        return;
                    }
                    pushChildTask(task, parentId);
                }
                return;
            }
            const cardsUnderCursor = elementsUnderCursor.filter((el) =>
                el.classList.contains('task-card')
            );
            const droppedOnCard = cardsUnderCursor[1];
            if (droppedOnCard && droppedOnCard !== e.target) {
                if (droppedOnCard.getAttribute('data-task-id') === task._id) {
                    // If the card is dropped on itself... somehow... do nothing
                    setIsFocused(false);
                    return;
                }
                if (task.taskName.length === 0) {
                    setIsFocused(false);

                    showAlert(
                        'Please enter the task name before making it a subtask.',
                        'error'
                    );
                    return;
                }
                pushChildTask(
                    task,
                    droppedOnCard.getAttribute('data-task-id') ?? ''
                );
                return;
            }
        },
        [
            debouncedUpdate,
            onDragStop,
            dispatch,
            task._id,
            setLocalTask,
            pushChildTask,
            isDragging,
            allowDropRef,
            setAllowDrop,
        ]
    );

    return {
        handleDragStart,
        handleDragStop,
    };
};
