import { FaCalendar, FaCopy, FaPlus, FaTag, FaTrash } from 'react-icons/fa6';
import { ProgressDropdown } from '../TaskCards/ProgressDropdown';
import SubtaskProgresses from '../TaskCards/SubtaskProgresses';
import { TaskProgress } from '@/types';
import { FaEllipsisV, FaInfoCircle } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { TaskDetails } from '../TaskDetails';
import { TaskDueDatePicker } from '../TaskCards/TaskDueDatePicker';
import { DueDateIndicator } from '../TaskCards/DueDateIndicator';
import { useAddSubtask } from '@/hooks/useAddSubtask';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import EmojiDropdown from '../EmojiDropdown';
import { duplicateTask, updateTask } from '@/store/tasksSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { toast } from 'react-toastify';

interface SubtaskTopBarProps {
    subtask: any;
    handleProgressChange: (TaskProgress: TaskProgress) => void;
    handleSetDueDate: (dueDate: Date | undefined) => void;
}

export const SubtaskTopBar = ({
    subtask,
    handleProgressChange,
    handleSetDueDate,
}: SubtaskTopBarProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isSubtaskMenuOpen, setIsSubtaskMenuOpen] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [deletingTasks, setDeletingTasks] = useState<Set<string>>(new Set());

    const menuRef = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsSubtaskMenuOpen(false);
            }
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target as Node)
            ) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const openSubtaskMenu = (id: string) => {
        setIsSubtaskMenuOpen(true);
    };

    const handleShowDetails = () => {
        setShowDetails(true);
        setIsSubtaskMenuOpen(false);
    };

    const { handleAddSubtask } = useAddSubtask({
        task: subtask,
        position: 'start',
    });

    const { handleDelete } = useDeleteTask({
        deletingTasks,
        setDeletingTasks,
    });

    const handleSetSubtaskEmoji = (emoji: string) => {
        if (subtask._id) {
            dispatch(updateTask({ _id: subtask._id, emoji: emoji }));
        }
    };

    const handleDuplicateTask = () => {
        dispatch(duplicateTask(subtask));
        toast.success('Task duplicated successfully');
    };

    return (
        <div className="flex justify-between items-top gap-2 h-auto pb-2">
            {showDetails && (
                <TaskDetails task={subtask} setShowDetails={setShowDetails} />
            )}
            {showDatePicker && (
                <TaskDueDatePicker
                    onSetDueDate={handleSetDueDate}
                    setShowDatePicker={setShowDatePicker}
                    setIsMenuOpen={setIsSubtaskMenuOpen}
                />
            )}
            {isSubtaskMenuOpen && (
                <div
                    ref={menuRef}
                    className="absolute top-10 right-0 w-48 rounded-md shadow-lg bg-base-300 z-10 border border-slate-700 ring-1 ring-black ring-opacity-5"
                >
                    <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                    >
                        <button
                            className="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-black w-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleShowDetails();
                            }}
                        >
                            <FaInfoCircle className="mr-2" /> Details
                        </button>
                        <button
                            className="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-black w-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowDatePicker(true);
                                setIsSubtaskMenuOpen(false);
                            }}
                        >
                            <FaCalendar className="mr-2" /> Set Due Date
                        </button>
                        <button
                            className="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-black w-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleAddSubtask();
                                setIsSubtaskMenuOpen(false);
                            }}
                        >
                            <FaPlus className="mr-2" /> Add Subtask
                        </button>
                        <button
                            className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-black w-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDelete(subtask._id);
                                setIsSubtaskMenuOpen(false);
                            }}
                        >
                            <FaTrash className="mr-2" /> Delete
                        </button>
                    </div>
                </div>
            )}
            <EmojiDropdown
                taskEmoji={subtask.emoji || <FaTag />}
                setTaskEmoji={handleSetSubtaskEmoji}
            />
            <div className="flex justify-between items-center gap-2">
                {subtask.dueDate && <DueDateIndicator task={subtask} />}
                <FaEllipsisV
                    className="cursor-pointer text-slate-400"
                    onClick={() => openSubtaskMenu(subtask._id as string)}
                />
            </div>
        </div>
    );
};
