// src/app/components/ControlPanelContent.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { setTheme } from '@/store/themeSlice';
import { Task, ThemeName } from '@/types';
import { getComplementaryColor, getContrastingColor } from '@/app/utils/utils';
import { FaArchive, FaTag } from 'react-icons/fa';
import {
    FaArrowRightFromBracket,
    FaCircleArrowLeft,
    FaGrip,
    FaImage,
    FaPaintbrush,
} from 'react-icons/fa6';
import { useTheme } from '@/hooks/useTheme';
import { setUser } from '@/store/userSlice';
import { ComponentSpinner } from '../ComponentSpinner';
import {
    setControlPanelOpen,
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
} from '@/store/uiSlice';
import { isMobile } from 'react-device-detect';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WallpaperSelector from '../Space/WallpaperSelector';
import { useUser } from '@clerk/nextjs';
interface ControlPanelContentProps {
    isOpen: boolean;
}

const ControlPanelContent: React.FC<ControlPanelContentProps> = ({
    isOpen,
}) => {
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const currentTheme = useSelector(
        (state: RootState) => state.theme.currentTheme
    );
    // const user = useSelector((state: RootState) => state.user.user);
    const { user } = useUser();
    const [isLoadingUser, setIsLoadingUser] = useState(false);

    const handleThemeChange = (theme: ThemeName) => {
        dispatch(setTheme(theme));
    };

    const onGoToSuperSpace = () => {
        router.push('/');
        dispatch(setSubtaskDrawerParentId(null));
        dispatch(setSubtaskDrawerOpen(false));
    };

    const currentSpace = useSelector(
        (state: RootState) => state.spaces.currentSpace
    );

    if (!currentSpace) {
        return null;
    }

    const contrastColor = getContrastingColor(currentSpace.color);
    const contrastInvertedColor = contrastColor === 'white' ? 'black' : 'white';

    const tasks = useSelector((state: RootState) => state.tasks.tasks);

    const tasksInSpace = tasks.filter(
        (task: Task) => task.space === currentSpace._id
    );

    const archivedTasks = tasks.filter((task: Task) => task.isArchived);

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
                zIndex: 10000,
                backgroundColor: `var(--${theme}-controlpanel-background)`,
            }}
        >
            {isMobile && (
                <button
                    className="absolute top-4 left-2 p-2 text-3xl"
                    style={{
                        color: 'white',
                    }}
                    onClick={() => dispatch(setControlPanelOpen(false))}
                >
                    <FaCircleArrowLeft />
                </button>
            )}
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
                        dispatch(setControlPanelOpen(false));
                        onGoToSuperSpace();
                    }}
                >
                    <div className="flex flex-row justify-between items-center text-lg font-bold">
                        <span className="truncate">{currentSpace?.name}</span>
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
                    <button
                        className="btn btn-sm btn-outline flex justify-center items-center mt-4 shadow-md hover:bg-white/10"
                        style={{
                            color: contrastColor,
                        }}
                        onClick={onGoToSuperSpace}
                    >
                        All Spaces
                        <FaArrowRightFromBracket />
                    </button>
                </div>
            </div>
            {/* Archive access */}
            <Link href="/profile/archive">
                <div
                    className="mt-4 p-4 rounded-lg shadow-md border-2 border-transparent hover:border-white hover:-rotate-2 transition-all duration-300 cursor-pointer"
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-100)`,
                        color: `var(--${currentTheme}-text-default)`,
                    }}
                    onClick={() => {
                        dispatch(setControlPanelOpen(false));
                    }}
                >
                    <h2 className="text-md font-semibold my-2 flex items-center justify-start gap-2">
                        <FaArchive
                            style={{
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                        />{' '}
                        Archive: {archivedTasks.length} task
                        {archivedTasks.length > 1 && 's'}
                    </h2>
                </div>
            </Link>
            {/* Customize theme */}
            <div className="mt-4">
                <h2 className="text-sm my-2 flex items-center gap-2">
                    <FaImage /> Set Space Wallpaper
                </h2>
                {/* Wallpaper picker with preview */}
                <WallpaperSelector space={currentSpace} />
            </div>
            <div className="mt-4 flex-grow">
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
            {/* Profile card */}
            <div className="grid grid-cols-3 gap-4 items-center">
                {isLoadingUser ? (
                    <ComponentSpinner />
                ) : (
                    user && (
                        <>
                            <img
                                src={
                                    user?.imageUrl ||
                                    '/images/profile_picture_default.webp'
                                }
                                alt="Profile"
                                className="rounded-full col-span-1"
                            />
                            <div className="col-span-2">
                                <p className="font-medium text-lg truncate">
                                    {user.fullName}
                                </p>
                                <p
                                    className="text-sm truncate"
                                    style={{
                                        color: 'white',
                                    }}
                                >
                                    {user.primaryEmailAddress?.emailAddress}
                                </p>
                                <Link href="/profile/profile">
                                    <button
                                        className="btn btn-sm mt-3 px-4 py-2 rounded-lg hover:border-white/25 hover:shadow-md"
                                        style={{
                                            backgroundColor: `var(--${currentTheme}-background-100)`,
                                            color: `var(--${currentTheme}-text-default)`,
                                        }}
                                        onClick={() => {
                                            dispatch(
                                                setControlPanelOpen(false)
                                            );
                                        }}
                                    >
                                        View Profile
                                    </button>
                                </Link>
                            </div>
                        </>
                    )
                )}
            </div>
        </div>
    );
};

export default ControlPanelContent;
