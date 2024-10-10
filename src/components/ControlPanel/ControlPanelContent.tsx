// src/app/components/ControlPanelContent.tsx
'use client';
import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { setTheme } from '@/store/themeSlice';
import { Task, ThemeName } from '@/types';
import { getContrastingColor } from '@/app/utils/utils';
import { FaArchive, FaTag } from 'react-icons/fa';
import {
    FaArrowRightFromBracket,
    FaCaretDown,
    FaCaretUp,
    FaCircleArrowLeft,
    FaImage,
    FaPaintbrush,
} from 'react-icons/fa6';
import { useTheme } from '@/hooks/useTheme';
import {
    setControlPanelOpen,
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
} from '@/store/uiSlice';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WallpaperSelector from '../Space/WallpaperSelector';
import { useUser } from '@clerk/nextjs';
import SpaceBackgroundColorPicker from '../Space/SpaceBackgroundColorPicker';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeOptionPreview from '../ThemeOptionPreview';
interface ControlPanelContentProps {
    isOpen: boolean;
}

const ControlPanelContent: React.FC<ControlPanelContentProps> = React.memo(
    ({ isOpen }) => {
        const router = useRouter();
        const theme = useTheme();
        const isMobileSize = useIsMobileSize();
        const dispatch = useDispatch<AppDispatch>();
        const currentTheme = useSelector(
            (state: RootState) => state.theme.currentTheme
        );
        const { user } = useUser();
        const [isBackgroundPickerOpen, setIsBackgroundPickerOpen] =
            useState(false);
        const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

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

        const contrastColor = useMemo(
            () => getContrastingColor(currentSpace.color),
            [currentSpace]
        );
        const contrastInvertedColor =
            contrastColor === 'white' ? 'black' : 'white';

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

        return (
            <div
                className={`fixed left-0 top-0 h-full w-64 bg-black bg-opacity-80 flex flex-col justify-between transform ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out pt-16`}
                style={{
                    zIndex: 10000,
                    backgroundColor: `var(--${theme}-controlpanel-background)`,
                }}
            >
                {isMobileSize && (
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
                <div className="p-4 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-rounded-full">
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
                                <span className="truncate">
                                    {currentSpace?.name}
                                </span>
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
                            className="mt-4 p-4 rounded-lg shadow-md border-2 border-transparent hover:border-white transition-border duration-300 cursor-pointer"
                            style={{
                                backgroundColor: `var(--${currentTheme}-background-100)`,
                                color: `var(--${currentTheme}-text-default)`,
                            }}
                            onClick={() => {
                                dispatch(setControlPanelOpen(false));
                            }}
                        >
                            <h2 className="text-md font-semibold flex items-center justify-start gap-2">
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
                    <div
                        className="mt-4 flex flex-col gap-2 bg-white/10 hover:bg-white/20 transition-all duration-300 p-4 rounded-lg cursor-pointer"
                        onClick={() =>
                            setIsBackgroundPickerOpen(!isBackgroundPickerOpen)
                        }
                    >
                        <div className="text-sm flex items-center gap-2">
                            <FaImage /> Space Background{' '}
                            {isBackgroundPickerOpen ? (
                                <FaCaretUp />
                            ) : (
                                <FaCaretDown />
                            )}
                        </div>
                        <AnimatePresence>
                            {isBackgroundPickerOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div
                                        className="flex flex-col gap-2"
                                        style={{
                                            height: '100%',
                                        }}
                                    >
                                        {/* Wallpaper picker with preview */}
                                        {!isMobileSize && (
                                            <WallpaperSelector
                                                space={currentSpace}
                                            />
                                        )}
                                        <SpaceBackgroundColorPicker
                                            space={currentSpace}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div
                        className="mt-4 bg-white/10 hover:bg-white/20 transition-all duration-300 p-4 rounded-lg cursor-pointer"
                        onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
                    >
                        <div className="text-sm flex items-center gap-2">
                            <FaPaintbrush />
                            {theme.charAt(0).toUpperCase() +
                                theme.slice(1)}{' '}
                            Theme
                            <div className="flex items-center justify-center gap-1 p-1 rounded-full bg-gray-500 border">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor: `var(--${currentTheme}-background-100)`,
                                    }}
                                ></div>
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor: `var(--${currentTheme}-background-200)`,
                                    }}
                                ></div>
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor: `var(--${currentTheme}-background-300)`,
                                    }}
                                ></div>
                            </div>
                            {isThemePickerOpen ? (
                                <FaCaretUp />
                            ) : (
                                <FaCaretDown />
                            )}
                        </div>
                        <AnimatePresence>
                            {isThemePickerOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col gap-2 mt-4"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {['buji', 'daigo', 'enzu'].map(
                                        (themeOption) => (
                                            <ThemeOptionPreview
                                                themeOption={
                                                    themeOption as ThemeName
                                                }
                                                handleThemeChange={
                                                    handleThemeChange
                                                }
                                            />
                                        )
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                {/* Profile card */}
                <div className="relative grid grid-cols-3 gap-4 items-center px-2 py-4 border-t border-white/25">
                    {user && (
                        <>
                            <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                <img
                                    src={
                                        user?.imageUrl ||
                                        '/images/profile_picture_default.webp'
                                    }
                                    alt="Profile"
                                    className="absolute inset-0 w-full h-full object-cover rounded-full"
                                />
                            </div>
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
                                        Edit Profile
                                    </button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }
);

export default ControlPanelContent;
