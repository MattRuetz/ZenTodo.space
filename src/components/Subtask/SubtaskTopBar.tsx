import { FaCalendar, FaPlus, FaTag, FaTrash } from 'react-icons/fa6';
import { TaskProgress } from '@/types';
import { FaEllipsisV, FaInfoCircle } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { TaskDetails } from '../TaskDetails';
import { TaskDueDatePicker } from '../TaskCards/TaskDueDatePicker';
import { DueDateIndicator } from '../TaskCards/DueDateIndicator';
import { useAddNewSubtask } from '@/hooks/useAddNewSubtask';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import EmojiDropdown from '../EmojiDropdown';
import { updateTask } from '@/store/tasksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import ConfirmDelete from '../TaskCards/ConfirmDelete';
import useClickOutside from '@/hooks/useClickOutside';
import { useTheme } from '@/hooks/useTheme';
interface SubtaskTopBarProps {
    subtask: any;
    handleProgressChange: (TaskProgress: TaskProgress) => void;
    handleSetDueDate: (dueDate: Date | undefined) => void;
    isSubtaskMenuOpen: boolean;
    setIsSubtaskMenuOpen: (isSubtaskMenuOpen: boolean) => void;
    setCurrentEmojiTask: (currentEmojiTask: string | null) => void;
    setIsEmojiPickerOpen: (isEmojiPickerOpen: boolean) => void;
}

export const SubtaskTopBar = ({
    subtask,
    handleProgressChange,
    handleSetDueDate,
    isSubtaskMenuOpen,
    setIsSubtaskMenuOpen,
    setCurrentEmojiTask,
    setIsEmojiPickerOpen,
}: SubtaskTopBarProps) => {
    const currentTheme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const [showDetails, setShowDetails] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [deletingTasks, setDeletingTasks] = useState<Set<string>>(new Set());

    const menuRef = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const currentSpaceId = useSelector(
        (state: RootState) => state.spaces.currentSpace?._id
    );

    const {
        initiateDeleteTask,
        cancelDelete,
        showDeleteConfirm,
        taskToDelete,
    } = useDeleteTask();

    useClickOutside([menuRef], () => setIsSubtaskMenuOpen(false));
    useClickOutside([datePickerRef], () => setShowDatePicker(false));

    const openSubtaskMenu = (id: string) => {
        setIsSubtaskMenuOpen(true);
    };

    const handleShowDetails = () => {
        setShowDetails(true);
        setIsSubtaskMenuOpen(false);
    };

    const { addNewSubtask } = useAddNewSubtask();

    const handleAddSubtask = () => {
        addNewSubtask({
            subtask: {
                taskName: 'New Subtask',
                taskDescription: '',
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                subtasks: [],
                zIndex: 0,
                progress: 'Not Started',
                space: currentSpaceId || '',
            },
            parentId: subtask._id,
            position: 'start',
        });
    };

    const handleSetSubtaskEmoji = (emoji: string) => {
        if (subtask._id) {
            dispatch(updateTask({ _id: subtask._id, emoji: emoji }));
        }
    };

    return (
        <div
            className="flex justify-between items-top gap-2 h-auto pb-2"
            style={{
                color: `var(--${currentTheme}-emphasis-light)`, // Use theme color
            }}
        >
            {showDetails && (
                <TaskDetails task={subtask} setShowDetails={setShowDetails} />
            )}
            {showDatePicker && (
                <TaskDueDatePicker
                    onSetDueDate={handleSetDueDate}
                    setShowDatePicker={setShowDatePicker}
                    setIsMenuOpen={setIsSubtaskMenuOpen}
                    datePickerRef={datePickerRef}
                    task={subtask}
                />
            )}
            {isSubtaskMenuOpen && (
                <div
                    ref={menuRef}
                    className="absolute top-10 right-0 w-48 rounded-md shadow-lg z-10"
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
                        border: `1px solid var(--${currentTheme}-accent-grey)`, // Use theme color
                    }}
                >
                    <div
                        className="py-1 flex flex-col"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                    >
                        <button
                            className="flex items-center px-4 py-2 text-sm hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleShowDetails();
                            }}
                        >
                            <FaInfoCircle className="mr-2" /> Details
                        </button>
                        <button
                            className="flex items-center px-4 py-2 text-sm hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                            }}
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
                            className="flex items-center px-4 py-2 text-sm hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                            }}
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
                            className="flex items-center px-4 py-2 text-sm hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-accent-red)`, // Use theme color
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                initiateDeleteTask(subtask._id);
                                setIsSubtaskMenuOpen(false);
                            }}
                        >
                            <FaTrash className="mr-2" /> Delete
                        </button>
                    </div>
                </div>
            )}
            {showDeleteConfirm && taskToDelete && (
                <ConfirmDelete
                    objectToDelete={taskToDelete}
                    cancelDelete={cancelDelete}
                    spaceOrTask={'task'}
                />
            )}
            <div
                onClick={() => {
                    setCurrentEmojiTask(subtask._id ?? null);
                    setIsEmojiPickerOpen(true);
                }}
                className="emoji-tag cursor-pointer p-1 transition-colors duration-200 rounded-lg"
            >
                <div className="emoji-tag-icon w-4 h-4 flex items-center justify-center hover:scale-110 hover:rotate-12 transition-transform duration-200">
                    {subtask.emoji || <FaTag />}
                </div>
            </div>
            <div className="flex justify-between items-center gap-2">
                {subtask.dueDate && (
                    <DueDateIndicator
                        task={subtask}
                        handleDueDateClick={() => setShowDatePicker(true)}
                    />
                )}
                <FaEllipsisV
                    className="cursor-pointer"
                    style={{
                        color: `var(--${currentTheme}-emphasis-light)`, // Use theme color
                    }}
                    onClick={() => openSubtaskMenu(subtask._id as string)}
                />
            </div>
        </div>
    );
};
