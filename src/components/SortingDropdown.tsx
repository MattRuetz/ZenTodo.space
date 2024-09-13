import React, { useState } from 'react';
import {
    FaSort,
    FaSortAlphaDown,
    FaSortAlphaUp,
    FaCalendarAlt,
    FaEdit,
} from 'react-icons/fa';

type SortOption = 'custom' | 'name' | 'created' | 'lastEdited';

interface SortingDropdownProps {
    onSortChange: (option: SortOption, reversed: boolean) => void;
}

const SortingDropdown: React.FC<SortingDropdownProps> = ({ onSortChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentSort, setCurrentSort] = useState<SortOption>('custom');
    const [isReversed, setIsReversed] = useState(false);

    const handleSortChange = (option: SortOption) => {
        if (option === currentSort) {
            setIsReversed(!isReversed);
        } else {
            setIsReversed(false);
        }
        setCurrentSort(option);
        onSortChange(option, option === currentSort ? !isReversed : false);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 bg-base-200 hover:bg-base-300 rounded-md px-2 py-1"
            >
                <FaSort />
                <span>{currentSort === 'custom' ? 'Sort' : currentSort}</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-base-300 rounded-md shadow-lg z-10">
                    <ul>
                        <li
                            className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('name')}
                        >
                            {currentSort === 'name' ? (
                                isReversed ? (
                                    <FaSortAlphaUp />
                                ) : (
                                    <FaSortAlphaDown />
                                )
                            ) : (
                                <FaSortAlphaDown />
                            )}
                            <span>Name</span>
                        </li>
                        <li
                            className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('created')}
                        >
                            <FaCalendarAlt />
                            <span>
                                Created{' '}
                                {currentSort === 'created' &&
                                    (isReversed ? '(Oldest)' : '(Newest)')}
                            </span>
                        </li>
                        <li
                            className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('lastEdited')}
                        >
                            <FaEdit />
                            <span>
                                Last Edited{' '}
                                {currentSort === 'lastEdited' &&
                                    (isReversed ? '(Oldest)' : '(Newest)')}
                            </span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SortingDropdown;
