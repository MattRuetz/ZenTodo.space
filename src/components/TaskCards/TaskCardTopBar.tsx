// src/components/icons/TaskCardTopBar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { FaArrowsAlt, FaEllipsisV, FaInfoCircle } from 'react-icons/fa';
import { FaCalendar, FaCopy, FaPlus, FaTrash } from 'react-icons/fa6';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Tooltip } from 'react-tooltip';
import { SpaceData, Task } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface TaskCardTopBarProps {
    className?: string;
    task: Task;
    onDelete: () => void;
    onDetails: () => void;
    onSetDueDate: (date: Date | undefined) => void;
    onAddSubtask: () => void;
    onMoveTask: (spaceId: string) => void;
    onCreateSpaceAndMoveTask: () => void;
    onDuplicateTask: () => void;
}

const TaskCardTopBar: React.FC<TaskCardTopBarProps> = React.memo(
    ({
        task,
        className = '',
        onDelete,
        onDetails,
        onSetDueDate,
        onAddSubtask,
        onMoveTask,
        onCreateSpaceAndMoveTask,
        onDuplicateTask,
    }) => {
        const spaces = useSelector((state: RootState) => state.spaces.spaces);

        const [isMenuOpen, setIsMenuOpen] = useState(false);
        const [showDatePicker, setShowDatePicker] = useState(false);
        const [dueDate, setDueDate] = useState<Date | null>(null);
        const [showMoveOptions, setShowMoveOptions] = useState(false);

        const menuRef = useRef<HTMLDivElement>(null);
        const datePickerRef = useRef<HTMLDivElement>(null);
        const moveOptionsRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    menuRef.current &&
                    !menuRef.current.contains(event.target as Node)
                ) {
                    setIsMenuOpen(false);
                }
                if (
                    datePickerRef.current &&
                    !datePickerRef.current.contains(event.target as Node)
                ) {
                    setShowDatePicker(false);
                }
                if (
                    moveOptionsRef.current &&
                    !moveOptionsRef.current.contains(event.target as Node)
                ) {
                    setShowMoveOptions(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        const handleMoveTask = (spaceId: string) => {
            onMoveTask(spaceId);
            setShowMoveOptions(false);
            setIsMenuOpen(false);
        };

        const handleMoveTaskToNewSpace = () => {
            onCreateSpaceAndMoveTask();
            setShowMoveOptions(false);
            setIsMenuOpen(false);
        };

        return (
            <div
                className={`flex flex-row gap-6 drag-handle cursor-move ${className}`}
            >
                <div className="justify-center w-full">
                    <div
                        className="mb-1 w-full bg-sky-950"
                        style={{ height: '1px' }}
                    ></div>
                    <div
                        className="mb-1 w-full bg-sky-950"
                        style={{ height: '1px' }}
                    ></div>
                    <div
                        className="mb-1 w-full bg-sky-950"
                        style={{ height: '1px' }}
                    ></div>
                </div>
                <div className="relative" ref={menuRef}>
                    <FaEllipsisV
                        size={14}
                        className="cursor-pointer text-sky-700 hover:text-sky-500 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    />
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-200 ring-1 ring-black ring-opacity-5">
                            <div
                                className="py-1"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="options-menu"
                            >
                                <button
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-slate-300 w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onDetails();
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <FaInfoCircle className="mr-2" /> Details
                                </button>
                                <button
                                    className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-slate-300 w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowDatePicker(true);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <FaCalendar className="mr-2" /> Set Due Date
                                </button>
                                <button
                                    className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-slate-300 w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onAddSubtask();
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <FaPlus className="mr-2" /> Add Subtask
                                </button>
                                <button
                                    className="flex items-center px-4 py-2 text-sm text-yellow-700 hover:bg-slate-300 w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowMoveOptions(true);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <FaArrowsAlt className="mr-2" /> Move Task
                                </button>
                                <button
                                    className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-slate-300 w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onDuplicateTask();
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <FaCopy className="mr-2" /> Duplicate Task
                                </button>
                                <button
                                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-slate-300 w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onDelete();
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <FaTrash className="mr-2" /> Delete
                                </button>
                            </div>
                        </div>
                    )}
                    {showDatePicker && (
                        <div
                            ref={datePickerRef}
                            className="absolute right-0 mt-2"
                        >
                            <ReactDatePicker
                                selected={dueDate}
                                onChange={(date: Date | null) =>
                                    setDueDate(date)
                                }
                                inline
                            />
                            <button
                                onClick={() => {
                                    onSetDueDate(dueDate || undefined);
                                    setShowDatePicker(false);
                                    setIsMenuOpen(false);
                                }}
                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Okay
                            </button>
                        </div>
                    )}
                    {showMoveOptions && (
                        <div
                            ref={moveOptionsRef}
                            className="absolute right-0 mt-2 w-48 bg-slate-200 rounded-md shadow-lg"
                        >
                            <div className="py-2 px-4">
                                Move to different space:
                            </div>
                            <ul>
                                <li
                                    className="px-4 py-2 hover:bg-slate-300 cursor-pointer"
                                    onClick={() => handleMoveTaskToNewSpace()}
                                >
                                    + New Space
                                </li>
                                {spaces.map((space: SpaceData) => (
                                    <li
                                        key={space._id}
                                        className="px-4 py-2 hover:bg-slate-300 cursor-pointer"
                                        onClick={() =>
                                            handleMoveTask(space._id || '')
                                        }
                                    >
                                        {space.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

export default TaskCardTopBar;
