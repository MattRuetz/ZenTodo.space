// src/components/SuperSpace/BottomSettings.tsx
import React, { useState, useCallback } from 'react';
import { FaPaintbrush } from 'react-icons/fa6';
import { useTheme } from '@/hooks/useTheme';
import ThemeMenu from './ThemeMenu';
import BuyMeACoffee from '../BuyMeACoffee';
import { ThemeName } from '@/types';
import ThemeOptionPreview from '../ThemeOptionPreview';

const BottomSettings: React.FC = React.memo(() => {
    const currentTheme = useTheme();
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);

    // Use useCallback to memoize the toggle function
    const toggleThemeMenu = useCallback(() => {
        setThemeMenuOpen((prev) => !prev);
    }, []);

    return (
        <div className="fixed bg-gray-800 bottom-0 left-0 w-full py-1 text-center flex items-center justify-between px-4 md:px-20">
            <BuyMeACoffee />

            <button
                onClick={toggleThemeMenu}
                className="transition flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
            >
                <FaPaintbrush />
                <ThemeOptionPreview
                    themeOption={currentTheme as ThemeName}
                    handleThemeChange={() => {}}
                />
            </button>

            <ThemeMenu
                isOpen={themeMenuOpen}
                onClose={() => setThemeMenuOpen(false)}
            />
        </div>
    );
});

export default BottomSettings;
