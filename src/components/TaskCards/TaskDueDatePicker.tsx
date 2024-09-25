import { useRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import { useTheme } from '@/hooks/useTheme';
import { FaTrash } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { Task } from '@/types';

interface TaskDueDatePickerProps {
    onSetDueDate: (dueDate: Date | undefined) => void;
    setShowDatePicker: (showDatePicker: boolean) => void;
    setIsMenuOpen: (isMenuOpen: boolean) => void;
    datePickerRef: React.RefObject<HTMLDivElement>;
    task: Task;
}

export const TaskDueDatePicker = ({
    onSetDueDate,
    setShowDatePicker,
    setIsMenuOpen,
    datePickerRef,
    task,
}: TaskDueDatePickerProps) => {
    const [dueDate, setDueDate] = useState<Date | null>(task.dueDate || null);
    const currentTheme = useTheme();
    const handleSetDueDate = (dueDate: Date | undefined) => {
        onSetDueDate(dueDate || undefined);
        setDueDate(dueDate || null);
        setShowDatePicker(false);
        setIsMenuOpen(false);
    };

    return (
        <div
            ref={datePickerRef}
            className="absolute right-0 mt-2"
            style={{
                backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
                border: `2px solid var(--${currentTheme}-accent-grey)`, // Use theme color
                borderRadius: '0.5rem', // Equivalent to rounded-lg
                padding: '0.5rem', // Equivalent to p-2
                zIndex: 20,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)', // Shadow effect
            }}
        >
            <ReactDatePicker
                selected={dueDate}
                onChange={(date: Date | null) => setDueDate(date)}
                inline
            />
            <div className="flex flex-row justify-between gap-2">
                <button
                    onClick={() => {
                        handleSetDueDate(dueDate || undefined);
                    }}
                    style={{
                        marginTop: '0.25rem', // Equivalent to mt-1
                        backgroundColor: `var(--${currentTheme}-accent-blue)`, // Use theme color
                        color: `var(--${currentTheme}-text-default)`, // Use theme color
                        padding: '0.5rem 1rem', // Equivalent to px-4 py-2
                        borderRadius: '0.25rem', // Equivalent to rounded
                    }}
                >
                    Okay
                </button>
                <button
                    data-tooltip-id="delete-due-date-tooltip"
                    onClick={() => {
                        setShowDatePicker(false);
                        setIsMenuOpen(false);
                        handleSetDueDate(undefined);
                    }}
                    style={{
                        marginTop: '0.25rem', // Equivalent to mt-1
                        backgroundColor: `var(--${currentTheme}-accent-red)`, // Use theme color
                        color: `var(--${currentTheme}-text-default)`, // Use theme color
                        padding: '0.5rem 1rem', // Equivalent to px-4 py-2
                        borderRadius: '0.25rem', // Equivalent to rounded
                    }}
                >
                    <FaTrash />
                    <Tooltip id="delete-due-date-tooltip" place="top">
                        Delete Due Date
                    </Tooltip>
                </button>
            </div>
        </div>
    );
};
