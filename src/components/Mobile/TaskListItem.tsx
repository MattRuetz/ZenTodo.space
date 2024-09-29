import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';
import { AppDispatch, RootState } from '../../store/store';
import { updateTask } from '@/store/tasksSlice';
import { Task, TaskProgress } from '@/types';
import { setSimplicityModalOpen, setSubtaskDrawerOpen } from '@/store/uiSlice';
import { useChangeHierarchy } from '@/hooks/useChangeHierarchy';
import { useMoveSubtask } from '@/hooks/useMoveSubtask';
import { useAlert } from '@/hooks/useAlert';
import useClickOutside from '@/hooks/useClickOutside';
import { useTheme } from '@/hooks/useTheme';
import { useArchiveTask } from '@/hooks/useArchiveTask';
import { SubtaskTopBar } from '../Subtask/SubtaskTopBar';
import { SubtaskBottomBar } from '../Subtask/SubtaskBottomBar';

const LONG_PRESS_DELAY = 1000; // 1 second delay

interface TaskListItemProps {
    task: Task;
    onClick: () => void;
    index: number;
    parentId: string | null;
}

const TaskListItem: React.FC<TaskListItemProps> = ({
    task,
    onClick,
    index,
    parentId,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTheme = useTheme();
    const { showAlert } = useAlert();
    const archiveTask = useArchiveTask();
    const { moveSubtaskTemporary, commitSubtaskOrder } = useMoveSubtask();

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

    const { convertTaskToSubtask, convertSubtaskToTask } = useChangeHierarchy();

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

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStartPos.current) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

        if (deltaX > 10 || deltaY > 10) {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
            setIsDragEnabled(false);
            setIsShaking(false);
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        setIsDragEnabled(false);
        setIsShaking(false);
        touchStartPos.current = null;
    }, []);

    const [{ isDragging }, drag] = useDrag({
        type: 'TASK',
        item: { id: task._id, index },
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

    useClickOutside([inputRef], () => handleBlur());

    const handleBlur = useCallback(() => {
        if (isEditing === 'taskName' && !currentTaskNameRef.current.trim()) {
            setLocalTask((prevTask) => ({
                ...prevTask,
                taskName: task.taskName,
            }));
            currentTaskNameRef.current = task.taskName;
        } else if (isEditing && task._id) {
            const updatedFields = {
                [isEditing]: currentTaskNameRef.current,
            };
            dispatch(updateTask({ _id: task._id, ...updatedFields }));
        }
        setIsEditing(null);
    }, [dispatch, isEditing, task]);

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

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsTaskMenuOpen(true);
    }, []);

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

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: 'TASK',
        drop: (item: { id: string }) => {
            console.log('drop item', item);
            if (item.id !== task._id) {
                convertTaskToSubtask(item.id, task._id);
            }
        },
        canDrop: (item: { id: string }) => item.id !== task._id,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    return (
        <li
            ref={drag(drop(ref))}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={onClick}
            className={`task-list-item p-4 ${
                isDragging ? 'opacity-50' : 'opacity-100'
            } ${
                isShaking ? 'shake' : ''
            } rounded-lg my-2 transition-colors duration-200 shadow-md border-2`}
            style={{
                cursor: 'move',
                backgroundColor:
                    isOver && canDrop
                        ? `var(--${currentTheme}-accent-blue)`
                        : `var(--${currentTheme}-background-100)`,
                borderColor: `var(--${currentTheme}-card-border-color)`,
            }}
        >
            <SubtaskTopBar
                subtask={task}
                handleProgressChange={handleProgressChange}
                handleSetDueDate={handleSetDueDate}
                isSubtaskMenuOpen={isTaskMenuOpen}
                setIsSubtaskMenuOpen={setIsTaskMenuOpen}
            />
            <div
                className={`${
                    isEditing === 'taskName'
                        ? 'border-slate-400'
                        : 'border-transparent'
                } font-semibold rounded-lg p-2 px-4 mb-2 transition-colors duration-200 border-2`}
                style={{
                    backgroundColor: `var(--${currentTheme}-background-200)`,
                    borderColor:
                        isEditing === 'taskName'
                            ? `var(--${currentTheme}-accent-grey)`
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
                        {localTask.taskName}
                    </h1>
                )}
            </div>
            <div
                className={`${
                    isEditing === 'taskDescription'
                        ? 'border-slate-400'
                        : 'border-transparent'
                } font-normal rounded-lg p-2 px-4 mb-2 transition-all duration-200 border-2`}
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
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
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
        </li>
    );
};

export default TaskListItem;
