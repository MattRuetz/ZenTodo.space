// src/components/Subtask/SortingDropdown.tsx
import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { setIsReversed, setSortOption } from '@/store/uiSlice';
import {
    FaSort,
    FaSortAlphaDown,
    FaSortAlphaUp,
    FaCalendarAlt,
    FaEdit,
    FaSignal,
    FaPizzaSlice,
} from 'react-icons/fa';
import { FaHourglassHalf } from 'react-icons/fa6';
import { useTheme } from '@/hooks/useTheme';
import { SortOption } from '@/types';

interface SortingDropdownProps {
    btnColor: string;
}

const SortingDropdown: React.FC<SortingDropdownProps> = React.memo(
    ({ btnColor }) => {
        const dispatch = useDispatch<AppDispatch>();
        const currentTheme = useTheme();

        // Imported selectors
        const sortOption = useSelector(
            (state: RootState) => state.ui.sortOption
        );
        const isReversed = useSelector(
            (state: RootState) => state.ui.isReversed
        );

        const [isOpen, setIsOpen] = useState(false);

        const handleSortChange = useCallback(
            (option: SortOption) => {
                setIsOpen(false);
                if (option === sortOption && option !== 'custom') {
                    dispatch(setIsReversed(!isReversed));
                } else {
                    dispatch(setIsReversed(false));
                }
                dispatch(setSortOption(option));
            },
            [dispatch, isReversed, sortOption]
        );

        const sortOptionString: Record<SortOption, string> = {
            name: isReversed ? 'Name (Z-a)' : 'Name (a-Z)',
            dueDate: 'Due Date ' + (isReversed ? '(Reverse)' : ''),
            progress: 'Progress',
            created: 'Created ' + (isReversed ? '(Oldest)' : '(Newest)'),
            lastEdited: 'Last Edited ' + (isReversed ? '(Oldest)' : '(Newest)'),
            custom: 'Custom',
        };

        return (
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="btn btn-sm md:btn-md btn-outline"
                    style={{ color: btnColor }}
                >
                    <div className="flex items-center gap-1">
                        <FaSort />
                        {sortOption === 'custom'
                            ? 'Sort'
                            : sortOptionString[sortOption]}
                    </div>
                </button>
                {isOpen && (
                    <div
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10"
                        style={{
                            backgroundColor: `var(--${currentTheme}-background-200)`,
                            border: `1px solid var(--${currentTheme}-text-default)`,
                        }}
                    >
                        <ul>
                            {[
                                'custom',
                                'dueDate',
                                'name',
                                'progress',
                                'created',
                                'lastEdited',
                            ].map((option) => (
                                <li
                                    key={option}
                                    className="px-4 py-2 hover:bg-black/20 cursor-pointer flex items-center space-x-2"
                                    onClick={() =>
                                        handleSortChange(option as SortOption)
                                    }
                                    style={{
                                        color: `var(--${currentTheme}-text-default)`,
                                    }}
                                >
                                    {option === 'custom' && <FaPizzaSlice />}
                                    {option === 'dueDate' && (
                                        <FaHourglassHalf />
                                    )}
                                    {option === 'name' &&
                                        (isReversed ? (
                                            <FaSortAlphaUp />
                                        ) : (
                                            <FaSortAlphaDown />
                                        ))}
                                    {option === 'progress' && <FaSignal />}
                                    {option === 'created' && <FaCalendarAlt />}
                                    {option === 'lastEdited' && <FaEdit />}
                                    <span>
                                        {sortOption === option &&
                                            (isReversed ? '(Reverse)' : '')}
                                        {sortOptionString[option as SortOption]}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
);

export default SortingDropdown;
