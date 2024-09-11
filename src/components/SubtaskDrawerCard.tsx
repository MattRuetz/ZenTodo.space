import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { updateTask } from '@/store/tasksSlice';
import { Task, TaskProgress } from '@/types';
import { ProgressDropdown } from './ProgressDropdown';
import { useDrag } from 'react-dnd';
import { convertSubtaskToTask } from '@/store/tasksSlice';
import { FaTrash } from 'react-icons/fa';
import { useDeleteTask } from '@/hooks/useDeleteTask';

interface SubtaskDrawerCardProps {
    subtask: Task;
}

const SubtaskDrawerCard: React.FC<SubtaskDrawerCardProps> = ({ subtask }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [localSubtask, setLocalSubtask] = useState(subtask);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const currentTaskNameRef = useRef(subtask.taskName);

    const [deletingTasks, setDeletingTasks] = useState<Set<string>>(new Set());

    const { handleDelete } = useDeleteTask({
        deletingTasks,
        setDeletingTasks,
    });

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: 'SUBTASK',
            item: () => {
                // This function will be called when the drag starts
                return { ...localSubtask };
            },
            end: (item, monitor) => {
                console.log('item', item);
                const dropResult = monitor.getDropResult() as {
                    x: number;
                    y: number;
                };
                console.log('dropResult', dropResult);

                if (item && dropResult.x && dropResult.y) {
                    dispatch(
                        convertSubtaskToTask({
                            subtask: { ...item },
                            dropPosition: dropResult,
                        })
                    );
                }
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [localSubtask, dispatch]
    ); // Add dependencies here

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                handleBlur();
            }
        };

        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing]);

    const handleBlur = useCallback(() => {
        if (isEditing === 'taskName' && !currentTaskNameRef.current.trim()) {
            setLocalSubtask((prevSubtask) => ({
                ...prevSubtask,
                taskName: subtask.taskName,
            }));
            currentTaskNameRef.current = subtask.taskName;
        } else if (isEditing && subtask._id) {
            const updatedFields = { [isEditing]: currentTaskNameRef.current };
            dispatch(updateTask({ _id: subtask._id, ...updatedFields }));
        }
        setIsEditing(null);
    }, [dispatch, isEditing, subtask]);

    const handleProgressChange = useCallback(
        (newProgress: TaskProgress) => {
            if (!subtask._id) return;
            console.log('newProgress', newProgress);
            const updatedFields = { progress: newProgress };
            dispatch(updateTask({ _id: subtask._id, ...updatedFields }));
            setLocalSubtask((prev) => ({ ...prev, progress: newProgress }));
        },
        [dispatch, subtask._id]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            if (name === 'taskName') {
                currentTaskNameRef.current = value;
            }
            setLocalSubtask((prevSubtask) => ({
                ...prevSubtask,
                [name]: value,
            }));
        },
        []
    );

    const startEditing = useCallback((fieldName: string) => {
        setIsEditing(fieldName);
    }, []);

    return (
        <li
            ref={drag as unknown as React.RefObject<HTMLLIElement>}
            key={subtask._id}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
                border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            className={`p-2 rounded-lg my-6 bg-base-100 transition-colors duration-500 shadow-md shadow-black/20`}
        >
            <div
                className={`${
                    isEditing === 'taskName'
                        ? 'border-slate-400'
                        : 'border-transparent'
                } font-semibold rounded-lg p-2 px-4 mb-2 bg-base-300 transition-colors duration-200 border-2`}
            >
                {isEditing === 'taskName' ? (
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        name="taskName"
                        value={localSubtask.taskName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className="w-full resize-none border-none outline-none bg-transparent"
                        maxLength={35}
                        autoFocus
                    />
                ) : (
                    <h1
                        className="cursor-pointer"
                        onClick={() => startEditing('taskName')}
                    >
                        {localSubtask.taskName}
                    </h1>
                )}
            </div>

            <div
                className={`${
                    isEditing === 'taskDescription'
                        ? 'border-slate-400'
                        : 'border-transparent'
                } font-normal rounded-lg p-2 px-4 mb-2 transition-all duration-200 bg-base-300 border-2`}
            >
                {isEditing === 'taskDescription' ? (
                    <textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        name="taskDescription"
                        value={localSubtask.taskDescription}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className="w-full resize-none flex-grow outline-none text-sm bg-transparent"
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            minHeight: '100px',
                            maxHeight: '500px',
                            overflowY: 'auto',
                        }}
                        maxLength={500}
                        autoFocus
                    />
                ) : (
                    <p
                        className="text-sm cursor-pointer"
                        onClick={() => startEditing('taskDescription')}
                    >
                        {localSubtask.taskDescription || (
                            <span className="text-neutral-500">
                                + Add description
                            </span>
                        )}
                    </p>
                )}
            </div>
            <div className="flex justify-between items-top relative">
                <ProgressDropdown
                    progress={subtask.progress}
                    onProgressChange={handleProgressChange}
                    isSubtask={true}
                />
                <FaTrash
                    className="cursor-pointer text-red-500 hover:text-red-700 transition-colors duration-200 hover:scale-110 hover:rotate-12 absolute top-1 right-0"
                    onClick={() => handleDelete(subtask._id || '')}
                />
            </div>
        </li>
    );
};

export default SubtaskDrawerCard;
