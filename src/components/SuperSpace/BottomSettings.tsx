import React, { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import ThemeMenu from './ThemeMenu';
import { FaPaintbrush } from 'react-icons/fa6';

const BottomSettings: React.FC = () => {
    const currentTheme = useTheme();
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);

    const toggleThemeMenu = () => {
        setThemeMenuOpen(!themeMenuOpen);
    };

    return (
        <div className="fixed bg-gray-800 bottom-0 left-0 w-full py-1 text-center flex items-center justify-end pr-20">
            <button
                onClick={toggleThemeMenu}
                className="transition flex items-center text-sm text-gray-400 hover:text-gray-200"
            >
                <FaPaintbrush />
                <span className="ml-2">{currentTheme}</span>
            </button>

            <ThemeMenu
                isOpen={themeMenuOpen}
                onClose={() => setThemeMenuOpen(false)}
            />
        </div>
    );
};

export default BottomSettings;