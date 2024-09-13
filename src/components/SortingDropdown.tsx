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
import { FaCakeCandles } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';

type SortOption = 'custom' | 'name' | 'progress' | 'created' | 'lastEdited';

interface SortingDropdownProps {}

const SortingDropdown: React.FC<SortingDropdownProps> = ({}) => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const sortOption = useSelector((state: RootState) => state.ui.sortOption);
    const isReversed = useSelector((state: RootState) => state.ui.isReversed);

    const handleSortChange = (option: SortOption) => {
        if (option === sortOption && option !== 'custom') {
            dispatch(setIsReversed(!isReversed));
        } else {
            dispatch(setIsReversed(false));
        }
        dispatch(setSortOption(option));
        console.log('global option', option);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 bg-sky-900 hover:bg-sky-800 rounded-md px-2 py-1"
            >
                <FaSort />
                <span>{sortOption === 'custom' ? 'Sort' : sortOption}</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-base-300 rounded-md shadow-lg z-10">
                    <ul>
                        <li
                            className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('custom')}
                        >
                            <FaPizzaSlice className="text-primary" />
                            <span>Custom</span>
                        </li>
                        <li
                            className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('name')}
                        >
                            {sortOption === 'name' ? (
                                isReversed ? (
                                    <>
                                        <FaSortAlphaUp className="text-primary" />
                                        <span>Name (a-Z)</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSortAlphaDown className="text-primary" />
                                        <span>Name (Z-a)</span>
                                    </>
                                )
                            ) : (
                                <>
                                    <FaSortAlphaDown className="text-primary" />
                                    <span>Name (Z-a)</span>
                                </>
                            )}
                        </li>
                        <li
                            className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('progress')}
                        >
                            <FaSignal className="text-primary" />
                            <span>Progress</span>
                        </li>
                        <li
                            className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('created')}
                        >
                            <FaCalendarAlt className="text-primary" />
                            <span>
                                Created{' '}
                                {sortOption === 'created' &&
                                    (isReversed ? '(Oldest)' : '(Newest)')}
                            </span>
                        </li>
                        <li
                            className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center space-x-2"
                            onClick={() => handleSortChange('lastEdited')}
                        >
                            <FaEdit className="text-primary" />
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
};

export default SortingDropdown;
