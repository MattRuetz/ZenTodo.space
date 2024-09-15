import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { setGlobalDragging, setDraggingCardId } from '../store/uiSlice';
import { Task } from '@/types';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { updateSpaceMaxZIndex } from '@/store/spaceSlice';

interface UseDragHandlersProps {
    task: Task;
    localTask: Task;
    setLocalTask: (task: (prev: Task) => Task) => void;
    setCardSize: (size: { width: number; height: number }) => void;
    onDragStart: () => void;
    onDragStop: () => void;
    getNewZIndex: () => number;
    pushChildTask: (task: Task, parentId: string) => void;
    debouncedUpdate: (task: Partial<Task>) => void;
    updateCardSize: () => void;
    updateTaskInStore: (task: Partial<Task>) => void;
    setIsFocused: (isFocused: boolean) => void;
    cardRef: React.RefObject<HTMLDivElement>;
    resizingRef: React.MutableRefObject<boolean>;
    startPosRef: React.MutableRefObject<{ x: number; y: number }>;
    startSizeRef: React.MutableRefObject<{ width: number; height: number }>;
}

export const useDragHandlers = ({
    task,
    setLocalTask,
    onDragStart,
    onDragStop,
    getNewZIndex,
    pushChildTask,
    debouncedUpdate,
    updateCardSize,
    updateTaskInStore,
    setIsFocused,
    cardRef,
    resizingRef,
    startPosRef,
    startSizeRef,
}: UseDragHandlersProps) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleDragStart = useCallback(
        (e: DraggableEvent, data: DraggableData) => {
            const newZIndex = getNewZIndex();
            setLocalTask((prevTask) => ({
                ...prevTask,
                zIndex: newZIndex,
            }));
            const spaceId = task.space; // Assuming spaceId is a property of task
            dispatch(updateSpaceMaxZIndex({ spaceId, maxZIndex: newZIndex }));

            console.log('drag start');

            dispatch(setGlobalDragging(true));
            dispatch(setDraggingCardId(task._id ?? ''));
            onDragStart();
        },
        [getNewZIndex, onDragStart, dispatch, task._id, setLocalTask]
    );

    const handleDragStop = useCallback(
        (e: DraggableEvent, data: DraggableData) => {
            setLocalTask((prevTask) => {
                const newTaskData = {
                    x: data.x,
                    y: data.y,
                    zIndex: prevTask.zIndex,
                };

                console.log('drag stop');
                // debouncedUpdate(newTaskData);
                return { ...prevTask, ...newTaskData };
            });
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
                    return;
                }
                if (task.taskName.length === 0) {
                    alert(
                        'Please enter the task name before making it a subtask.'
                    );
                    return;
                }
                pushChildTask(
                    task,
                    droppedOnCard.getAttribute('data-task-id') ?? ''
                );
            }
        },
        [
            debouncedUpdate,
            onDragStop,
            dispatch,
            task._id,
            setLocalTask,
            pushChildTask,
        ]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setLocalTask(
                (prev: Task): Task => ({
                    ...prev,
                    [name]: value,
                })
            );
            updateCardSize();
        },
        [updateCardSize, setLocalTask]
    );

    const handleInputBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setIsFocused(false);
            const fieldName = e.target.name;
            const fieldValue = e.target.value;
            console.log('fieldName', fieldName);

            setLocalTask((prevTask) => {
                const newTaskData = { [fieldName]: fieldValue };
                // Do not use debouncedUpdate here.
                // This is because we do not want the update to be inter
                updateTaskInStore(newTaskData);
                return { ...prevTask, ...newTaskData };
            });
            updateCardSize();
        },
        [setLocalTask, updateTaskInStore, updateCardSize]
    );

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
        handleMouseDown,
    };
};
