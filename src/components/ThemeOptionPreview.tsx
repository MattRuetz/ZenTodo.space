import { ThemeName } from '@/types';
import React from 'react';

interface ThemeOptionPreviewProps {
    themeOption: ThemeName;
    handleThemeChange: (themeOption: ThemeName) => void;
}

const ThemeOptionPreview: React.FC<ThemeOptionPreviewProps> = ({
    themeOption,
    handleThemeChange,
}) => {
    return (
        <div
            key={themeOption}
            onClick={() => handleThemeChange(themeOption as ThemeName)}
            className="p-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors h-full flex items-center justify-between gap-2"
            style={{
                backgroundColor: `var(--${themeOption}-background-100)`,
                color: `var(--${themeOption}-text-default)`,
            }}
        >
            {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)} Theme
            <div className="flex items-center justify-center gap-1 p-1 rounded-full bg-gray-500 border">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{
                        backgroundColor: `var(--${themeOption}-background-100)`,
                    }}
                ></div>
                <div
                    className="w-2 h-2 rounded-full"
                    style={{
                        backgroundColor: `var(--${themeOption}-background-200)`,
                    }}
                ></div>
                <div
                    className="w-2 h-2 rounded-full"
                    style={{
                        backgroundColor: `var(--${themeOption}-background-300)`,
                    }}
                ></div>
            </div>
        </div>
    );
};

export default ThemeOptionPreview;
