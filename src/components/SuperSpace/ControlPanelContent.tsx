// src/app/components/ControlPanelContent.tsx
'use client';
import React from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setTheme } from '@/store/themeSlice';

interface ControlPanelContentProps {
    isOpen: boolean;
}

const ControlPanelContent: React.FC<ControlPanelContentProps> = React.memo(
    ({ isOpen }) => {
        const dispatch = useDispatch();
        const currentTheme = useSelector(
            (state: RootState) => state.theme.currentTheme
        );

        const handleThemeChange = (theme: 'buji' | 'daigo' | 'enzu') => {
            dispatch(setTheme(theme));
        };

        return (
            <div
                className={`fixed left-0 top-0 h-full w-64 bg-base-200 bg-opacity-80 p-4 flex flex-col transform ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out pt-20`}
                style={{ zIndex: 9999 }}
            >
                <div className="flex-grow">
                    <h2 className="text-lg font-bold">Select Theme</h2>
                    <div className="flex flex-col space-y-2">
                        {['buji', 'daigo', 'enzu'].map((theme) => (
                            <div
                                key={theme}
                                className={`p-2 cursor-pointer rounded ${
                                    currentTheme === theme
                                        ? 'border-2 border-blue-500'
                                        : ''
                                }`}
                                style={{
                                    backgroundColor: `var(--${theme}-background-100)`,
                                    color: `var(--${theme}-text-default)`,
                                }}
                                onClick={() =>
                                    handleThemeChange(
                                        theme as 'buji' | 'daigo' | 'enzu'
                                    )
                                }
                            >
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}{' '}
                                Theme
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => signOut()}
                    className="btn btn-primary w-full"
                >
                    Log out
                </button>
            </div>
        );
    }
);

export default ControlPanelContent;
