// src/components/icons/TaskCardTopBar.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
    FaArrowsAlt,
    FaEllipsisV,
    FaInfoCircle,
    FaQuestionCircle,
} from 'react-icons/fa';
import {
    FaCalendar,
    FaClock,
    FaCopy,
    FaPlus,
    FaTag,
    FaTrash,
} from 'react-icons/fa6';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SpaceData, Task } from '@/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import EmojiDropdown from '../EmojiDropdown';
import { updateTask } from '@/store/tasksSlice';
import { Tooltip } from 'react-tooltip';
import { TaskDueDatePicker } from './TaskDueDatePicker';
import { DueDateIndicator } from './DueDateIndicator';
import { useTheme } from '@/hooks/useTheme';
import TaskMenu from './TaskMenu';

interface TaskCardTopBarProps {
    className?: string;
    task: Task;
    onDelete: () => void;
    onDetails: () => void;
    onSetDueDate: (date: Date | undefined) => void;
    onAddSubtask: () => void;
    onSetEmoji: (emoji: string) => void;
    onMoveTask: (spaceId: string) => void;
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
        onSetEmoji,
        onMoveTask,
        onDuplicateTask,
    }) => {
        const dispatch = useDispatch<AppDispatch>();
        const spaces = useSelector((state: RootState) => state.spaces.spaces);
        const currentTheme = useTheme();

        const [isMenuOpen, setIsMenuOpen] = useState(false);
        const [showDatePicker, setShowDatePicker] = useState(false);
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

        const handleShowDetails = () => {
            onDetails();
            setIsMenuOpen(false);
        };

        const handleSetTaskEmoji = (emoji: string) => {
            if (task._id) {
                onSetEmoji(emoji);
                dispatch(updateTask({ _id: task._id, emoji: emoji }));
            }
        };

        return (
            <div
                className={`flex flex-row gap-4 drag-handle cursor-move items-center ${className}`}
            >
                <div
                    className="text-xl"
                    style={{ color: `var(--${currentTheme}-emphasis-light)` }}
                >
                    <EmojiDropdown
                        taskEmoji={task.emoji || <FaTag />}
                        setTaskEmoji={handleSetTaskEmoji}
                    />
                </div>
                <div className="justify-center w-full">
                    <div
                        className="mb-1 w-full"
                        style={{
                            height: '1px',
                            backgroundColor: `var(--${currentTheme}-background-300)`,
                        }}
                    ></div>
                    <div
                        className="mb-1 w-full"
                        style={{
                            height: '1px',
                            backgroundColor: `var(--${currentTheme}-background-300)`,
                        }}
                    ></div>
                    <div
                        className="mb-1 w-full"
                        style={{
                            height: '1px',
                            backgroundColor: `var(--${currentTheme}-background-300)`,
                        }}
                    ></div>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    {task.dueDate && (
                        <DueDateIndicator
                            task={task}
                            handleDueDateClick={() => setShowDatePicker(true)}
                        />
                    )}
                    <div className="relative" ref={menuRef}>
                        <FaEllipsisV
                            size={14}
                            className="cursor-pointer"
                            style={{
                                color: `var(--${currentTheme}-emphasis-light)`,
                            }}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        />
                        <TaskMenu
                            isMenuOpen={isMenuOpen}
                            currentTheme={currentTheme}
                            handleShowDetails={handleShowDetails}
                            setShowDatePicker={setShowDatePicker}
                            setIsMenuOpen={setIsMenuOpen}
                            onAddSubtask={onAddSubtask}
                            onDuplicateTask={onDuplicateTask}
                            onDelete={onDelete}
                            showDatePicker={showDatePicker}
                            showMoveOptions={showMoveOptions}
                            spaces={spaces}
                            task={task}
                            onSetDueDate={onSetDueDate}
                            handleMoveTask={handleMoveTask}
                            setShowMoveOptions={setShowMoveOptions}
                        />
                    </div>
                </div>
            </div>
        );
    }
);

export default TaskCardTopBar;
