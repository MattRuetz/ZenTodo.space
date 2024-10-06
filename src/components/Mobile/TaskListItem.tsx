import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';
import { AppDispatch, RootState, store } from '../../store/store';
import { updateTask } from '@/store/tasksSlice';
import { Task, TaskProgress } from '@/types';
import { setSimplicityModalOpen, setSubtaskDrawerOpen } from '@/store/uiSlice';
import { useChangeHierarchy } from '@/hooks/useChangeHierarchy';
import { useMoveSubtask } from '@/hooks/useMoveSubtask';
import { useAlert } from '@/hooks/useAlert';
import useClickOutside from '@/hooks/useClickOutside';
import { useTheme } from '@/hooks/useTheme';
import { useArchiveTask } from '@/hooks/useArchiveTask';
import { SubtaskBottomBar } from '../Subtask/SubtaskBottomBar';
import { getGrandparentTask, isGrandparent } from '@/app/utils/hierarchyUtils';
import { TaskListItemTopBar } from './TaskListItemTopBar';

const LONG_PRESS_DELAY = 300; // 1 second delay

interface TaskListItemProps {
    task: Task;
    onClick: () => void;
    index: number;
    parentId: string | null;
    setIsEmojiPickerOpen: (isOpen: boolean) => void;
    setCurrentEmojiTask: (currentEmojiTask: string | null) => void;
}

const TaskListItem: React.FC<TaskListItemProps> = ({
    task,
    onClick,
    index,
    setIsEmojiPickerOpen,
    setCurrentEmojiTask,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTheme = useTheme();
    const { showAlert } = useAlert();
    const archiveTask = useArchiveTask();
    const [localTask, setLocalTask] = useState(task || {});
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(false);
    const [isDragEnabled, setIsDragEnabled] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const touchStartPos = useRef<{ x: number; y: number } | null>(null);
    const [isShaking, setIsShaking] = useState(false);

    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const currentTaskNameRef = useRef(task?.taskName || '');
    const ref = useRef<HTMLLIElement>(null);

    const { convertTaskToSubtask } = useChangeHierarchy();

    const handleArchive = useCallback(() => {
        archiveTask(task);
        dispatch(setSubtaskDrawerOpen(false));
    }, [archiveTask, task, dispatch]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartPos.current = { x: touch.clientX, y: touch.clientY };
        longPressTimer.current = setTimeout(() => {
            setIsDragEnabled(true);
            setIsShaking(true);
        }, LONG_PRESS_DELAY);
    }, []);

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!touchStartPos.current) return;

            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
            const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

            if (deltaX > 10 || deltaY > 10) {
                if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = null;
                }
                if (!isDragEnabled) {
                    setIsDragEnabled(false);
                    setIsShaking(false);
                }
            }
        },
        [isDragEnabled]
    );

    const handleTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;

            setIsDragEnabled(false);
            setIsShaking(false);
        }
        touchStartPos.current = null;
    }, []);

    const [{ isDragging }, drag] = useDrag({
        type: 'TASK',
        item: { task },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => isDragEnabled,
    });

    useEffect(() => {
        if (isDragging) {
            setIsShaking(true);
            const timer = setTimeout(() => setIsShaking(false), 500); // Stop shaking after 500ms
            return () => clearTimeout(timer);
        } else {
            setIsShaking(false);
        }
    }, [isDragging]);

    useEffect(() => {
        if (!isDragging) {
            setIsDragEnabled(false);
            setIsShaking(false);
        }
    }, [isDragging]);

    useClickOutside([inputRef], () => handleBlur());

    const handleBlur = useCallback(() => {
        if (!task._id) return;

        let updatedFields: Partial<Task> = {};

        if (isEditing === 'taskName') {
            const trimmedTaskName = currentTaskNameRef.current.trim();
            if (!trimmedTaskName) {
                setLocalTask((prevTask) => ({
                    ...prevTask,
                    taskName: task.taskName,
                }));
                currentTaskNameRef.current = task.taskName;
            } else if (trimmedTaskName !== task.taskName) {
                updatedFields.taskName = trimmedTaskName;
            }
        } else if (isEditing === 'taskDescription') {
            const trimmedDescription = localTask.taskDescription?.trim() || '';
            if (trimmedDescription !== task.taskDescription) {
                updatedFields.taskDescription = trimmedDescription;
            }
        }

        if (Object.keys(updatedFields).length > 0) {
            dispatch(updateTask({ _id: task._id, ...updatedFields }));
        }

        setIsEditing(null);
    }, [dispatch, isEditing, task, localTask.taskDescription]);

    const handleProgressChange = useCallback(
        (newProgress: TaskProgress) => {
            if (!task._id) return;
            const updatedFields = { progress: newProgress };
            dispatch(updateTask({ _id: task._id, ...updatedFields }));
            setLocalTask((prev) => ({ ...prev, progress: newProgress }));
        },
        [dispatch, task]
    );

    const handleSetDueDate = (date: Date | undefined) => {
        if (!task._id) return;
        dispatch(updateTask({ _id: task._id, dueDate: date || null }));
    };

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            if (name === 'taskName') {
                currentTaskNameRef.current = value;
            }
            setLocalTask((prevTask) => ({
                ...prevTask,
                [name]: value,
            }));
        },
        []
    );

    const startEditing = useCallback((fieldName: string) => {
        setIsEditing(fieldName);
    }, []);

    const handleDrop = useCallback(
        (item: Task) => {
            const targetSubtask = task;
            // Fetch the latest version of the dragged task from the Redux store
            const state = store.getState() as RootState;
            const draggedSubtask = state.tasks.tasks.find(
                (task) => task._id === item._id
            );

            if (!draggedSubtask) {
                console.error('Dragged subtask not found in the store');
                showAlert('An unknown error occurred', 'error');
                return;
            }
            // Check if the dropped task is already a parent of the target subtask
            const isGrandparentCheck = isGrandparent(
                draggedSubtask,
                state.tasks.tasks
            );
            const isAlreadyParentAndSubtask =
                draggedSubtask.subtasks.length > 0 &&
                draggedSubtask.ancestors &&
                draggedSubtask.ancestors.length > 1;

            const isGrandchild = getGrandparentTask(
                targetSubtask,
                state.tasks.tasks
            );

            if (draggedSubtask._id === targetSubtask._id) {
                // handleDropOnSelf();
                return;
            } else if (
                !isGrandparentCheck &&
                !isAlreadyParentAndSubtask &&
                !isGrandchild
            ) {
                convertTaskToSubtask(
                    draggedSubtask,
                    targetSubtask._id as string
                );
            } else {
                // dispatch(setSimplicityModalOpen(true));
                showAlert(
                    'Too many levels of subtasks. Keep it simple!',
                    'error'
                );
            }
        },
        [dispatch, task]
    );

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: 'TASK',
        drop: (item: { task: Task }) => {
            handleDrop(item.task);
        },
        canDrop: (item: { task: Task }) => item.task._id !== task._id,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    drag(drop(ref));

    return (
        <li
            key={task.clientId || task._id} // Use clientId if available, otherwise fall back to _id
            ref={ref}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative task-list-item p-2 ${
                (isDragging || isShaking) && 'shake'
            } rounded-lg transition-all duration-200 border-2 px-2 mx-auto max-w-[350px]`}
            style={{
                cursor: 'move',
                backgroundColor:
                    isDragging || isShaking
                        ? `var(--${currentTheme}-background-100)`
                        : `var(--${currentTheme}-background-100)`,
                borderColor:
                    isOver && canDrop
                        ? `var(--${currentTheme}-accent-blue)`
                        : `var(--${currentTheme}-card-border-color)`,
                filter:
                    isDragging || isShaking
                        ? 'blur(1px)'
                        : isOver
                        ? 'brightness(1.1)'
                        : 'none',
            }}
        >
            <div className="w-10/12 max-w-[300px] mx-auto">
                <TaskListItemTopBar
                    task={task}
                    handleProgressChange={handleProgressChange}
                    handleSetDueDate={handleSetDueDate}
                    isMenuOpen={isTaskMenuOpen}
                    setIsMenuOpen={setIsTaskMenuOpen}
                    setIsEmojiPickerOpen={setIsEmojiPickerOpen}
                    setCurrentEmojiTask={setCurrentEmojiTask}
                />
                {/* <p>{task._id}</p> */}

                <div
                    className={`${
                        isEditing === 'taskName'
                            ? 'border-slate-400'
                            : 'border-transparent'
                    } font-semibold rounded p-1 px-2 mb-2 transition-colors duration-200 border-2`}
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`,
                        borderColor:
                            isEditing === 'taskName'
                                ? `var(--${currentTheme}-accent-grey)`
                                : localTask.taskName === '' ||
                                  localTask.taskName === 'New Subtask'
                                ? `var(--${currentTheme}-accent-red)`
                                : 'transparent',
                        color: `var(--${currentTheme}-text-default)`,
                    }}
                >
                    {isEditing === 'taskName' ? (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type="text"
                            name="taskName"
                            value={localTask.taskName}
                            onChange={handleInputChange}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.currentTarget.blur();
                                }
                            }}
                            onBlur={handleBlur}
                            className="w-full resize-none border-none outline-none bg-transparent"
                            maxLength={30}
                            onFocus={(event) => event.target.select()}
                            autoFocus
                        />
                    ) : (
                        <h1
                            className="cursor-pointer"
                            onClick={() => startEditing('taskName')}
                        >
                            {localTask.taskName || (
                                <span
                                    className="text-xs"
                                    style={{
                                        color: `var(--${currentTheme}-text-subtle)`,
                                    }}
                                >
                                    + Add task name
                                </span>
                            )}
                        </h1>
                    )}
                </div>
                <div
                    className={`${
                        isEditing === 'taskDescription'
                            ? 'border-slate-400'
                            : 'border-transparent'
                    } font-normal rounded p-1 px-2 mb-2 transition-all duration-200 border-2`}
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`,
                        borderColor:
                            isEditing === 'taskDescription'
                                ? `var(--${currentTheme}-accent-grey)`
                                : 'transparent',
                    }}
                >
                    {isEditing === 'taskDescription' ? (
                        <textarea
                            ref={
                                inputRef as React.RefObject<HTMLTextAreaElement>
                            }
                            name="taskDescription"
                            value={localTask.taskDescription}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full resize-none flex-grow outline-none text-sm bg-transparent"
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                minHeight: '100px',
                                maxHeight: '500px',
                                overflowY: 'auto',
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                            maxLength={500}
                            autoFocus
                        />
                    ) : (
                        <p
                            className="text-sm cursor-pointer max-h-[200px] overflow-y-auto"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                                whiteSpace: 'pre-wrap',
                            }}
                            onClick={() => startEditing('taskDescription')}
                        >
                            {localTask.taskDescription || (
                                <span
                                    className="text-xs"
                                    style={{
                                        color: `var(--${currentTheme}-text-subtle)`,
                                        opacity: 0.5,
                                    }}
                                >
                                    + Add description
                                </span>
                            )}
                        </p>
                    )}
                </div>
                <SubtaskBottomBar
                    subtask={task}
                    handleProgressChange={handleProgressChange}
                    handleSetDueDate={handleSetDueDate}
                    handleArchive={handleArchive}
                />
            </div>
        </li>
    );
};

export default TaskListItem;
