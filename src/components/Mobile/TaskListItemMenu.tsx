// src/components/Mobile/TaskListItemMenu.tsx
import useClickOutside from '@/hooks/useClickOutside';
import { useRef, useCallback } from 'react';
import {
    FaArrowsAlt,
    FaCalendar,
    FaCopy,
    FaInfoCircle,
    FaPlus,
    FaTrash,
} from 'react-icons/fa';

interface TaskListItemMenuProps {
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

const TaskListItemMenu: React.FC<TaskListItemMenuProps> = ({
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
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const moveOptionsRef = useRef<HTMLDivElement>(null);

    useClickOutside([menuRef, datePickerRef, moveOptionsRef], () => {
        setIsMenuOpen(false);
        setShowDatePicker(false);
        setShowMoveOptions(false);
    });

    const handleButtonClick = useCallback(
        (action: () => void) => {
            action();
            setIsMenuOpen(false);
        },
        [setIsMenuOpen]
    );

    const themeStyles = {
        backgroundColor: `var(--${currentTheme}-background-200)`,
        border: `1px solid var(--${currentTheme}-accent-grey)`,
        textColor: `var(--${currentTheme}-text-default)`,
        deleteColor: `var(--${currentTheme}-accent-red)`,
    };

    return (
        <div
            ref={menuRef}
            className="absolute top-10 right-0 w-48 rounded-md shadow-lg z-10"
            style={{
                backgroundColor: themeStyles.backgroundColor,
                border: themeStyles.border,
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
                        color: themeStyles.textColor,
                    }}
                    onClick={() => handleButtonClick(handleShowDetails)}
                >
                    <FaInfoCircle className="mr-2" /> Details
                </button>
                <button
                    className="flex items-center px-4 py-2 text-sm hover:bg-black/20"
                    style={{
                        color: themeStyles.textColor,
                    }}
                    onClick={() =>
                        handleButtonClick(() => {
                            setShowDatePicker(true);
                        })
                    }
                >
                    <FaCalendar className="mr-2" /> Set Due Date
                </button>
                <button
                    className="flex items-center px-4 py-2 text-sm hover:bg-black/20"
                    style={{
                        color: themeStyles.textColor,
                    }}
                    onClick={() => handleButtonClick(onAddSubtask)}
                >
                    <FaPlus className="mr-2" /> Add Subtask
                </button>
                {isSubtask ? (
                    <button
                        className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                        style={{
                            color: themeStyles.textColor,
                        }}
                        onClick={() => handleButtonClick(onMakeMainTask)}
                    >
                        <FaArrowsAlt className="mr-2" /> Make Main Task
                    </button>
                ) : (
                    <>
                        <button
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: themeStyles.textColor,
                            }}
                            onClick={() =>
                                handleButtonClick(() =>
                                    setShowMoveOptions(true)
                                )
                            }
                        >
                            <FaArrowsAlt className="mr-2" /> Move Task
                        </button>
                        <button
                            className="flex items-center px-4 py-2 text-sm w-full hover:bg-black/20"
                            style={{
                                color: themeStyles.textColor,
                            }}
                            onClick={() => handleButtonClick(onDuplicateTask)}
                        >
                            <FaCopy className="mr-2" /> Duplicate Task
                        </button>
                    </>
                )}
                <button
                    className="flex items-center px-4 py-2 text-sm hover:bg-black/20"
                    style={{
                        color: themeStyles.deleteColor,
                    }}
                    onClick={() => handleButtonClick(onDelete)}
                >
                    <FaTrash className="mr-2" /> Delete
                </button>
            </div>
        </div>
    );
};

export default TaskListItemMenu;
