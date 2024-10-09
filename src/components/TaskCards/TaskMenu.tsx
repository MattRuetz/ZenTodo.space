// src/components/TaskCards/TaskMenu.tsx
import React, { useCallback } from 'react';
import {
    FaInfoCircle,
    FaCalendar,
    FaPlus,
    FaArrowsAlt,
    FaCopy,
    FaTrash,
} from 'react-icons/fa';

import { TaskDueDatePicker } from './TaskDueDatePicker';

import { SpaceData, Task } from '@/types';

interface TaskMenuProps {
    isMenuOpen: boolean;
    currentTheme: string;
    handleShowDetails: () => void;
    setShowDatePicker: (show: boolean) => void;
    setIsMenuOpen: (open: boolean) => void;
    setShowMoveOptions: (show: boolean) => void;
    onAddSubtask: () => void;
    onDuplicateTask: () => void;
    onDelete: () => void;
    showDatePicker: boolean;
    showMoveOptions: boolean;
    spaces: SpaceData[];
    task: Task;
    onSetDueDate: (dueDate: Date | undefined) => void;
    handleMoveTask: (spaceId: string) => void;
    menuRef: React.RefObject<HTMLDivElement>;
    datePickerRef: React.RefObject<HTMLDivElement>;
    moveOptionsRef: React.RefObject<HTMLDivElement>;
}

const TaskMenu: React.FC<TaskMenuProps> = ({
    isMenuOpen,
    currentTheme,
    handleShowDetails,
    setShowDatePicker,
    setIsMenuOpen,
    setShowMoveOptions,
    onAddSubtask,
    onDuplicateTask,
    onDelete,
    showDatePicker,
    showMoveOptions,
    spaces,
    task,
    onSetDueDate,
    handleMoveTask,
    menuRef,
    datePickerRef,
    moveOptionsRef,
}) => {
    const handleMenuClick = useCallback(
        (callback: () => void) => {
            return (e: React.MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                callback();
                setIsMenuOpen(false);
            };
        },
        [setIsMenuOpen]
    );

    return (
        <>
            {isMenuOpen && (
                <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50"
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`,
                        border: `1px solid var(--${currentTheme}-accent-grey)`,
                    }}
                >
                    <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                    >
                        <button
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                            onClick={handleMenuClick(handleShowDetails)}
                        >
                            <FaInfoCircle className="mr-2" /> Details
                        </button>
                        <button
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                            onClick={handleMenuClick(() => {
                                setShowDatePicker(true);
                            })}
                        >
                            <FaCalendar className="mr-2" /> Set Due Date
                        </button>
                        <button
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                            onClick={handleMenuClick(onAddSubtask)}
                        >
                            <FaPlus className="mr-2" /> Add Subtask
                        </button>
                        <button
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                            onClick={handleMenuClick(() => {
                                setShowMoveOptions(true);
                            })}
                        >
                            <FaArrowsAlt className="mr-2" /> Move Task
                        </button>
                        <button
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                            onClick={handleMenuClick(onDuplicateTask)}
                        >
                            <FaCopy className="mr-2" /> Duplicate Task
                        </button>
                        <button
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-accent-red)`,
                            }}
                            onClick={handleMenuClick(onDelete)}
                        >
                            <FaTrash className="mr-2" /> Delete
                        </button>
                    </div>
                </div>
            )}
            {showDatePicker && (
                <div ref={datePickerRef}>
                    <TaskDueDatePicker
                        datePickerRef={datePickerRef}
                        onSetDueDate={onSetDueDate}
                        setShowDatePicker={setShowDatePicker}
                        setIsMenuOpen={setIsMenuOpen}
                        task={task}
                    />
                </div>
            )}
            {showMoveOptions && (
                <div
                    ref={moveOptionsRef}
                    className="absolute right-0 mt-2 w-48 rounded"
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`,
                        border: `1px solid var(--${currentTheme}-accent-grey)`,
                    }}
                >
                    <div className="py-2 px-4">Move to different space:</div>
                    <ul>
                        {spaces
                            .filter(
                                (space: SpaceData) => space._id !== task.space
                            )
                            .map((space: SpaceData) => (
                                <li
                                    key={space._id}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-black/20 cursor-pointer"
                                    onClick={() =>
                                        handleMoveTask(space._id || '')
                                    }
                                >
                                    <div
                                        className="w-3 h-3 rounded-full border border-white"
                                        style={{
                                            backgroundColor: space.color,
                                        }}
                                    ></div>
                                    {space.name}
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </>
    );
};

export default React.memo(TaskMenu);
