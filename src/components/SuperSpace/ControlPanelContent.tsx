// src/app/components/ControlPanelContent.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { setTheme } from '@/store/themeSlice';
import { Task, ThemeName } from '@/types';
import { getComplementaryColor, getContrastingColor } from '@/app/utils/utils';
import { FaArchive, FaSignOutAlt, FaTag } from 'react-icons/fa';
import { FaPaintbrush, FaUserAstronaut } from 'react-icons/fa6';
import { useTheme } from '@/hooks/useTheme';
import { setUser } from '@/store/userSlice';
import { ComponentSpinner } from '../ComponentSpinner';
interface ControlPanelContentProps {
    isOpen: boolean;
    toggleZoom: () => void;
    setIsProfilePageOpen: (isProfilePageOpen: boolean) => void;
}

const ControlPanelContent: React.FC<ControlPanelContentProps> = React.memo(
    ({ isOpen, toggleZoom, setIsProfilePageOpen }) => {
        const theme = useTheme();
        const dispatch = useDispatch<AppDispatch>();
        const currentTheme = useSelector(
            (state: RootState) => state.theme.currentTheme
        );
        const user = useSelector((state: RootState) => state.user.user);
        const [isLoadingUser, setIsLoadingUser] = useState(false);

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

        // const archivedTasks = tasks.filter(
        //     (task: Task) => task.space === currentSpace._id && task.archived
        // );

        const taskProgressCounts = {
            'Not Started': 0,
            'In Progress': 0,
            Blocked: 0,
            Complete: 0,
        };

        tasksInSpace.forEach((task: Task) => {
            taskProgressCounts[task.progress]++;
        });

        // Make sure the user is set in the redux store
        useEffect(() => {
            if (!user) {
                const fetchUserData = async () => {
                    try {
                        setIsLoadingUser(true);
                        const response = await fetch('/api/user');
                        if (response.ok) {
                            const userData = await response.json();
                            dispatch(setUser(userData));
                        }
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                    } finally {
                        setIsLoadingUser(false);
                    }
                };

                fetchUserData();
            } else {
                setIsLoadingUser(false);
            }
        }, [dispatch, user]);

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
                    <div className="text-sm mb-2 flex items-center gap-2">
                        Current Space:
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
                                    color: `${contrastInvertedColor}`,
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
                <hr
                    className="my-6"
                    style={{
                        borderColor: `var(--${currentTheme}-background-100)`,
                    }}
                />
                <div className="flex-grow">
                    <h2 className="text-sm my-2 flex items-center gap-2">
                        <FaPaintbrush /> Select Theme:
                    </h2>
                    <select
                        value={currentTheme}
                        onChange={(e) =>
                            handleThemeChange(
                                e.target.value as 'buji' | 'daigo' | 'enzu'
                            )
                        }
                        className="text-sm p-2 border rounded-lg cursor-pointer w-full"
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
                {/* TODO: Add archive functionality */}
                <div className="my-2">
                    <h2 className="text-sm my-2 flex items-center gap-2">
                        <FaArchive /> Archive: {tasksInSpace.length} task
                        {tasksInSpace.length > 1 && 's'}
                    </h2>
                </div>
                <hr className="my-6" />
                <div className="grid grid-cols-3 gap-4 items-center">
                    {isLoadingUser ? (
                        <ComponentSpinner />
                    ) : (
                        <>
                            <img
                                src={user.profilePicture} // Placeholder for user's profile picture
                                alt="Profile"
                                className="rounded-full col-span-1"
                            />
                            <div className="col-span-2">
                                <p className="font-medium text-lg truncate">
                                    {user.name}
                                </p>{' '}
                                <p className="text-sm text-gray-500 truncate">
                                    {user.email}
                                </p>
                                <button
                                    className="btn btn-sm bg-white/10 hover:bg-transparent hover:border-white/25 px-2 py-1 text-sm mt-2"
                                    style={{
                                        color: `var(--${currentTheme}-emphasis-light)`,
                                    }}
                                    onClick={() => setIsProfilePageOpen(true)}
                                >
                                    View Profile
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }
);

export default ControlPanelContent;
