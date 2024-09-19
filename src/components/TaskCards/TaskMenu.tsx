import { SpaceData, Task } from '@/types';
import {
    FaInfoCircle,
    FaCalendar,
    FaPlus,
    FaArrowsAlt,
    FaCopy,
    FaTrash,
} from 'react-icons/fa';
import { TaskDueDatePicker } from './TaskDueDatePicker';

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
    moveOptionsRef: React.RefObject<HTMLDivElement>;
    spaces: SpaceData[];
    task: Task;
    onSetDueDate: (dueDate: Date | undefined) => void;
    handleMoveTask: (spaceId: string) => void;
}

export default function TaskMenu({
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
    moveOptionsRef,
    spaces,
    task,
    onSetDueDate,
    handleMoveTask,
}: TaskMenuProps) {
    return (
        <>
            {isMenuOpen && (
                <div
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
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleShowDetails();
                            }}
                        >
                            <FaInfoCircle className="mr-2" /> Details
                        </button>
                        <button
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
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
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
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
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
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
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
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
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-accent-red)`,
                            }}
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
                <TaskDueDatePicker
                    onSetDueDate={onSetDueDate}
                    setShowDatePicker={setShowDatePicker}
                    setIsMenuOpen={setIsMenuOpen}
                />
            )}
            {showMoveOptions && (
                <div
                    ref={moveOptionsRef}
                    className="absolute right-0 mt-2 w-48"
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
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-black cursor-pointer"
                                    style={{
                                        backgroundColor: `transparent`,
                                    }}
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
}
