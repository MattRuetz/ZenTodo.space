import { useRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';

interface TaskDueDatePickerProps {
    onSetDueDate: (dueDate: Date | undefined) => void;
    setShowDatePicker: (showDatePicker: boolean) => void;
    setIsMenuOpen: (isMenuOpen: boolean) => void;
}

export const TaskDueDatePicker = ({
    onSetDueDate,
    setShowDatePicker,
    setIsMenuOpen,
}: TaskDueDatePickerProps) => {
    const datePickerRef = useRef<HTMLDivElement>(null);
    const [dueDate, setDueDate] = useState<Date | null>(null);

    const handleSetDueDate = (dueDate: Date | undefined) => {
        onSetDueDate(dueDate || undefined);
        setDueDate(dueDate || null);
        setShowDatePicker(false);
        setIsMenuOpen(false);
    };

    return (
        <div
            ref={datePickerRef}
            className="absolute right-0 mt-2 bg-slate-200 shadow-md shadow-black/20 border-2 border-slate-500 rounded-lg p-2 z-20 flex flex-col"
        >
            <ReactDatePicker
                selected={dueDate}
                onChange={(date: Date | null) => setDueDate(date)}
                inline
            />
            <button
                onClick={() => {
                    handleSetDueDate(dueDate || undefined);
                }}
                className="mt-1 bg-sky-700 text-white px-4 py-2 rounded"
            >
                Okay
            </button>
        </div>
    );
};
