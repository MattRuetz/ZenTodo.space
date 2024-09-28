import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { setTheme } from '@/store/themeSlice';
import { useDispatch } from 'react-redux';
import { ThemeName } from '@/types';
import { AppDispatch } from '@/store/store';
import { FaAngleDown, FaX } from 'react-icons/fa6';

const ThemeMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
    isOpen,
    onClose,
}) => {
    const currentTheme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    const handleThemeChange = (theme: ThemeName) => {
        dispatch(setTheme(theme));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="absolute bottom-full right-20 bg-gray-800/50 backdrop-blur text-white p-4 rounded-t-lg border-b border-gray-900">
            <h2 className="text-sm font-bold mb-4">Select Theme</h2>
            <div className="flex flex-col">
                {['buji', 'daigo', 'enzu'].map((theme) => (
                    <button
                        key={theme}
                        onClick={() => handleThemeChange(theme as ThemeName)}
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

export default ThemeMenu;
