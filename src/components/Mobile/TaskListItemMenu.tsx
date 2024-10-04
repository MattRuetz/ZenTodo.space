import useClickOutside from '@/hooks/useClickOutside';
import { useRef } from 'react';
import {
    FaArrowsAlt,
    FaCalendar,
    FaCopy,
    FaInfoCircle,
    FaPlus,
    FaTrash,
} from 'react-icons/fa';

interface TaskListItemMenuProps {
    isMenuOpen: boolean;
    currentTheme: string;
    handleShowDetails: () => void;
    setShowDatePicker: (show: boolean) => void;
    setIsMenuOpen: (open: boolean) => void;
    setShowMoveOptions: (show: boolean) => void;
    onAddSubtask: () => void;
    onDuplicateTask: () => void;
    onDelete: () => void;
    onMakeMainTask: () => void;
    isSubtask: boolean;
}

const TaskListItemMenu = ({
    isMenuOpen,
    currentTheme,
    handleShowDetails,
    setShowDatePicker,
    setIsMenuOpen,
    setShowMoveOptions,
    onAddSubtask,
    onDuplicateTask,
    onDelete,
    onMakeMainTask,
    isSubtask,
}: TaskListItemMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const moveOptionsRef = useRef<HTMLDivElement>(null);

    useClickOutside([menuRef, datePickerRef, moveOptionsRef], () => {
        setIsMenuOpen(false);
        setShowDatePicker(false);
        setShowMoveOptions(false);
    });

    return (
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
                        setIsMenuOpen(false);
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
                        onAddSubtask();
                        setIsMenuOpen(false);
                    }}
                >
                    <FaPlus className="mr-2" /> Add Subtask
                </button>
                {isSubtask ? (
                    <>
                        <button
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onMakeMainTask();
                                setIsMenuOpen(false);
                            }}
                        >
                            <FaArrowsAlt className="mr-2" /> Make Main Task
                        </button>
                    </>
                ) : (
                    <>
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
                    </>
                )}
                <button
                    className="flex items-center px-4 py-2 text-sm hover:bg-black/20"
                    style={{
                        color: `var(--${currentTheme}-accent-red)`, // Use theme color
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
    );
};

export default TaskListItemMenu;
