// src/app/components/ControlPanelContent.tsx
'use client';
import React from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { setTheme } from '@/store/themeSlice';
import { Task, ThemeName } from '@/types';
import { getComplementaryColor, getContrastingColor } from '@/app/utils/utils';
import { FaTag } from 'react-icons/fa';
import { FaPaintbrush, FaUserAstronaut } from 'react-icons/fa6';
import { useTheme } from '@/hooks/useTheme';
interface ControlPanelContentProps {
    isOpen: boolean;
    toggleZoom: () => void;
}

const ControlPanelContent: React.FC<ControlPanelContentProps> = React.memo(
    ({ isOpen, toggleZoom }) => {
        const theme = useTheme();
        const dispatch = useDispatch<AppDispatch>();
        const currentTheme = useSelector(
            (state: RootState) => state.theme.currentTheme
        );

        const handleThemeChange = (theme: ThemeName) => {
            dispatch(setTheme(theme));
        };

        const currentSpace = useSelector(
            (state: RootState) => state.spaces.currentSpace
        );

        if (!currentSpace) {
            return null;
        }

        const contrastColor = getContrastingColor(currentSpace.color);
        const contrastInvertedColor =
            contrastColor === 'white' ? 'black' : 'white';
        const complementaryColor = getComplementaryColor(currentSpace.color);

        const tasks = useSelector((state: RootState) => state.tasks.tasks);

        const tasksInSpace = tasks.filter(
            (task: Task) => task.space === currentSpace._id
        );

        const taskProgressCounts = {
            'Not Started': 0,
            'In Progress': 0,
            Blocked: 0,
            Complete: 0,
        };

        tasksInSpace.forEach((task: Task) => {
            taskProgressCounts[task.progress]++;
        });

        return (
            <div
                className={`fixed left-0 top-0 h-full w-64 bg-black bg-opacity-80 p-4 flex flex-col transform ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out pt-20`}
                style={{
                    zIndex: 9999,
                    backgroundColor: `var(--${theme}-controlpanel-background)`,
                }}
            >
                <div className="my-2">
                    <div className="text-lg mb-2 flex items-center gap-2">
                        <FaUserAstronaut /> Current Space:
                    </div>
                    <div
                        className="current-space-card p-4 rounded-lg cursor-pointer shadow-md border-2 border-transparent hover:border-white hover:rotate-1 transition-all duration-300"
                        style={{
                            backgroundColor: `${currentSpace?.color}`,
                            color: `${contrastColor}`,
                        }}
                        onClick={() => {
                            // go to super space
                            toggleZoom();
                        }}
                    >
                        <div className="flex flex-row justify-between items-center text-lg font-bold">
                            <span>{currentSpace?.name}</span>
                            <span
                                className="p-1 rounded-full w-8 h-8 flex items-center justify-center"
                                style={{
                                    backgroundColor: `${contrastColor}`,
                                }}
                            >
                                {currentSpace?.emoji || <FaTag />}
                            </span>
                        </div>
                        <span className="text-sm">
                            Total tasks: {tasksInSpace.length}
                        </span>
                        <hr
                            className="my-2"
                            style={{ borderColor: contrastColor }}
                        />
                        <table className="text-xs w-full">
                            <tbody>
                                {/* only show progress items that have a non-zero count */}
                                {Object.entries(taskProgressCounts).map(
                                    ([progress, count]) =>
                                        count > 0 && (
                                            <tr key={progress}>
                                                <td className="font-medium">
                                                    {progress}:
                                                </td>
                                                <td>
                                                    {
                                                        taskProgressCounts[
                                                            progress as keyof typeof taskProgressCounts
                                                        ]
                                                    }
                                                </td>
                                            </tr>
                                        )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <hr className="my-6" />
                <div className="flex-grow">
                    <h2 className="text-lg my-2 flex items-center gap-2">
                        <FaPaintbrush /> Select Theme:
                    </h2>
                    <select
                        value={currentTheme}
                        onChange={(e) =>
                            handleThemeChange(
                                e.target.value as 'buji' | 'daigo' | 'enzu'
                            )
                        }
                        className="p-2 border rounded-lg cursor-pointer w-full"
                    >
                        {['buji', 'daigo', 'enzu'].map((theme) => (
                            <option
                                key={theme}
                                value={theme}
                                style={{
                                    backgroundColor: `var(--${theme}-background-100)`,
                                    color: `var(--${theme}-emphasis-light)`,
                                }}
                            >
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}{' '}
                                Theme
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => signOut()}
                    className="btn w-full border border-white hover:border-transparent"
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-100)`,
                        color: `var(--${currentTheme}-emphasis-light)`,
                    }}
                >
                    Log out
                </button>
            </div>
        );
    }
);

export default ControlPanelContent;
