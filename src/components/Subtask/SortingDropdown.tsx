import { RootState } from '@/store/store';
import { setIsReversed, setSortOption } from '@/store/uiSlice';
import React, { useState } from 'react';
import {
    FaSort,
    FaSortAlphaDown,
    FaSortAlphaUp,
    FaCalendarAlt,
    FaEdit,
    FaSignal,
    FaPizzaSlice,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@/hooks/useTheme';
import { FaHourglassHalf } from 'react-icons/fa6';
import { SortOption } from '@/types';

interface SortingDropdownProps {}

const SortingDropdown: React.FC<SortingDropdownProps> = React.memo(() => {
    const dispatch = useDispatch();
    const currentTheme = useTheme();
    // Imported selectors
    const sortOption = useSelector((state: RootState) => state.ui.sortOption);
    const isReversed = useSelector((state: RootState) => state.ui.isReversed);

    const [isOpen, setIsOpen] = useState(false);

    const handleSortChange = (option: SortOption) => {
        setIsOpen(false);
        if (option === sortOption && option !== 'custom') {
            dispatch(setIsReversed(!isReversed));
        } else {
            dispatch(setIsReversed(false));
        }
        dispatch(setSortOption(option));
    };

    const sortOptionString = {
        name: isReversed ? 'Name (a-Z)' : 'Name (Z-a)',
        dueDate: 'Due Date ' + (isReversed ? '(Reverse)' : ''),
        progress: 'Progress',
        created: 'Created ' + (isReversed ? '(Oldest)' : '(Newest)'),
        lastEdited: 'Last Edited ' + (isReversed ? '(Oldest)' : '(Newest)'),
        custom: 'Custom',
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 px-2 py-1 rounded-md shadow-sm"
                style={{
                    backgroundColor: `var(--${currentTheme}-accent-blue)`, // Use theme color
                    color: `var(--${currentTheme}-text-default)`, // Use theme color
                }}
            >
                <FaSort />
                <span>
                    {sortOption === 'custom'
                        ? 'Sort'
                        : sortOptionString[sortOption]}
                </span>
            </button>
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10"
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
                        border: `1px solid var(--${currentTheme}-text-default)`, // Use theme color
                    }}
                >
                    <ul>
                        <li
                            className="px-4 py-2 hover:bg-black/20 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('custom')}
                            style={{
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                            }}
                        >
                            <FaPizzaSlice
                                className="text-primary"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }}
                            />
                            <span>Custom</span>
                        </li>
                        <li
                            className="px-4 py-2 hover:bg-black/20 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('dueDate')}
                            style={{
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                            }}
                        >
                            <FaHourglassHalf
                                className="text-primary"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }}
                            />
                            <span>Due Date</span>
                        </li>
                        <li
                            className="px-4 py-2 hover:bg-black/20 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('name')}
                            style={{
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                            }}
                        >
                            {sortOption === 'name' ? (
                                isReversed ? (
                                    <>
                                        <FaSortAlphaUp
                                            className="text-primary"
                                            style={{
                                                color: `var(--${currentTheme}-text-default)`,
                                            }}
                                        />
                                        <span>Name (a-Z)</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSortAlphaDown
                                            className="text-primary"
                                            style={{
                                                color: `var(--${currentTheme}-text-default)`,
                                            }}
                                        />
                                        <span>Name (Z-a)</span>
                                    </>
                                )
                            ) : (
                                <>
                                    <FaSortAlphaDown
                                        className="text-primary"
                                        style={{
                                            color: `var(--${currentTheme}-text-default)`,
                                        }}
                                    />
                                    <span>Name (Z-a)</span>
                                </>
                            )}
                        </li>
                        <li
                            className="px-4 py-2 hover:bg-black/20 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('progress')}
                            style={{
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                            }}
                        >
                            <FaSignal
                                className="text-primary"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }}
                            />
                            <span>Progress</span>
                        </li>
                        <li
                            className="px-4 py-2 hover:bg-black/20 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('created')}
                            style={{
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                            }}
                        >
                            <FaCalendarAlt
                                className="text-primary"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }}
                            />
                            <span>
                                Created{' '}
                                {sortOption === 'created' &&
                                    (isReversed ? '(Oldest)' : '(Newest)')}
                            </span>
                        </li>
                        <li
                            className="px-4 py-2 hover:bg-black/20 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('lastEdited')}
                            style={{
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                            }}
                        >
                            <FaEdit
                                className="text-primary"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }}
                            />
                            <span>
                                Last Edited{' '}
                                {sortOption === 'lastEdited' &&
                                    (isReversed ? '(Oldest)' : '(Newest)')}
                            </span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
});

export default SortingDropdown;
