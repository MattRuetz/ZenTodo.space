// src/components/SuperSpace/ThemeMenu.tsx
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { setTheme } from '@/store/themeSlice';
import { FaAngleDown } from 'react-icons/fa6';

import { useTheme } from '@/hooks/useTheme';

import { ThemeName } from '@/types';

const availableThemes: ThemeName[] = ['buji', 'daigo', 'enzu'];

interface ThemeMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const ThemeMenu: React.FC<ThemeMenuProps> = ({ isOpen, onClose }) => {
    const currentTheme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    const handleThemeChange = useCallback(
        (theme: ThemeName) => {
            dispatch(setTheme(theme));
            onClose();
        },
        [dispatch, onClose]
    );

    if (!isOpen) return null;

    return (
        <div className="absolute bottom-full right-20 bg-gray-800/50 backdrop-blur text-white p-4 rounded-t-lg border-b border-gray-900">
            <h2 className="text-sm font-bold mb-4">Select Theme</h2>
            <div className="flex flex-col">
                {availableThemes.map((theme) => (
                    <button
                        key={theme}
                        onClick={() => handleThemeChange(theme)}
                        className={`p-2 rounded-lg mb-2 transition-colors ${
                            currentTheme === theme
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-white'
                        }`}
                        style={{
                            backgroundColor: `var(--${theme}-background-100)`,
                            color: `var(--${theme}-emphasis-light)`,
                        }}
                    >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme
                    </button>
                ))}
            </div>
            <button
                onClick={onClose}
                className="absolute top-1 left-1 p-1 hover:bg-gray-900 transition-colors text-xs rounded-full"
            >
                <FaAngleDown />
            </button>
        </div>
    );
};

export default React.memo(ThemeMenu);
