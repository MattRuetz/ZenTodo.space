import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SpaceData, Task } from '@/types';
import { deleteSpace, reorderSpaces, updateSpace } from '@/store/spaceSlice';
import { AppDispatch, RootState } from '@/store/store';
import EmojiDropdown from '../EmojiDropdown';
import { FaClock, FaTag } from 'react-icons/fa';
import { getComplementaryColor, getContrastingColor } from '@/app/utils/utils';
import { FaClockRotateLeft, FaPalette, FaTrash } from 'react-icons/fa6';
import { useDrag, useDrop } from 'react-dnd';
import ConfirmDelete from '../TaskCards/ConfirmDelete';
import { isMobile } from 'react-device-detect';
import { useRouter } from 'next/navigation';

interface SpaceCardProps {
    space: SpaceData;
    index: number;
    moveSpaceCard: (dragIndex: number, hoverIndex: number) => void;
    handleDragEnd: () => void;
    onClick: () => void;
}

const SpaceCard: React.FC<SpaceCardProps> = ({
    space,
    index,
    moveSpaceCard,
    handleDragEnd,
    onClick,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(space.name);
    const [color, setColor] = useState(space.color);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragEnabled, setIsDragEnabled] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const touchStartPos = useRef<{ x: number; y: number } | null>(null);
    const emojiInputRef = useRef<HTMLInputElement>(null);
    const LONG_PRESS_DELAY = 300; // 300ms delay

    useEffect(() => {
        if (!isMobile) {
            setIsDragEnabled(true);
        }
    }, [isMobile]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartPos.current = { x: touch.clientX, y: touch.clientY };
        longPressTimer.current = setTimeout(() => {
            setIsDragEnabled(true);
            setIsShaking(true);
        }, LONG_PRESS_DELAY);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStartPos.current) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

        if (deltaX > 10 || deltaY > 10) {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
            setIsDragEnabled(false);
            setIsShaking(false);
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        setIsDragEnabled(false);
        setIsShaking(false);
        touchStartPos.current = null;
    }, []);

    const tasks = useSelector((state: RootState) =>
        state.tasks.tasks.filter((task: Task) => task.space === space._id)
    );

    const tasksDueToday = tasks.filter((task: Task) => {
        const dueDate = new Date(task.dueDate || '');
        const today = new Date();
        return (
            dueDate.getFullYear() === today.getFullYear() &&
            dueDate.getMonth() === today.getMonth() &&
            dueDate.getDate() === today.getDate()
        );
    });

    const tasksDueThisWeek = tasks.filter((task: Task) => {
        const dueDate = new Date(task.dueDate || '');
        const today = new Date();
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);
        return dueDate >= today && dueDate <= endOfWeek;
    });

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const ref = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: 'SPACE_CARD',
        item: () => ({ id: space._id, index }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => isDragEnabled,
    });

    const [, drop] = useDrop({
        accept: 'SPACE_CARD',
        hover(item: { id: string; index: number }, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
            const hoverClientX = clientOffset!.x - hoverBoundingRect.left;

            // Check if the mouse is within the bounds of the card
            const hoverHeight = hoverBoundingRect.height;
            const hoverWidth = hoverBoundingRect.width;

            if (
                hoverClientY < 0 ||
                hoverClientY > hoverHeight ||
                hoverClientX < 0 ||
                hoverClientX > hoverWidth
            ) {
                return;
            }

            // Time to actually perform the action
            moveSpaceCard(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
        drop: () => {
            handleDragEnd();
        },
    });

    drag(drop(ref));

    useEffect(() => {
        if (isDragging) {
            setIsShaking(true);
            const timer = setTimeout(() => setIsShaking(false), 500); // Stop shaking after 500ms
            return () => clearTimeout(timer);
        } else {
            setIsShaking(false);
        }
    }, [isDragging]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
    };

    const handleSubmit = () => {
        dispatch(updateSpace({ ...space, name, color }));
        setIsEditing(false);
    };

    const handleSetSpaceEmoji = (emoji: string) => {
        dispatch(updateSpace({ ...space, emoji }));
    };

    const handleCardClick = (e: React.MouseEvent) => {
        if (!isEditing) {
            router.push('/space/' + space._id);
            onClick();
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const contrastColor = getContrastingColor(color);
    const contrastInvertedColor = contrastColor === 'white' ? 'black' : 'white';
    const complementaryColor = getComplementaryColor(color);

    const handleEmojiClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isMobile && emojiInputRef.current) {
            emojiInputRef.current.click();
        }
    };

    // const handleEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const newEmoji = e.target.value;
    //     if (newEmoji) {
    //         handleSetSpaceEmoji(newEmoji);
    //     }
    // };

    return (
        <div
            ref={ref}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`space rounded-lg shadow-md hover:shadow-xl p-4 md:p-8 cursor-pointer relative flex flex-row justify-start items-center gap-4 min-h-[150px] max-h-[300px] md:hover:-rotate-1 border-4 border-transparent md:hover:border-white transition-all duration-300 ease-in-out ${
                isDragging || isShaking ? 'shake opacity-50' : ''
            }`}
            style={{
                backgroundColor: space.color,
            }}
            onClick={handleCardClick}
        >
            <div
                className=" shadow-slate-900 rounded-full p-1 text-2xl"
                style={{
                    backgroundColor: contrastColor,
                    border: `1px solid ${contrastColor}`,
                    color: complementaryColor,
                }}
            >
                {isEditing ? (
                    <div
                        className="relative border-2 rounded-full p-1 z-50 sm:absolute sm:top-2 sm:right-2 md:relative md:top-0 md:right-0"
                        style={{
                            borderColor: complementaryColor,
                            borderStyle: 'dashed',
                        }}
                        onClick={handleEmojiClick}
                    >
                        <EmojiDropdown
                            taskEmoji={space.emoji || <FaTag />}
                            setTaskEmoji={handleSetSpaceEmoji}
                        />
                    </div>
                ) : (
                    <span className="text-2xl p-1 flex items-center justify-center">
                        {space.emoji || <FaTag />}
                    </span>
                )}
            </div>
            {isEditing ? (
                <div className="h-full">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col justify-center gap-3 h-full pr-4"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            className="input input-bordered w-full"
                            maxLength={20}
                        />
                        <div className="flex items-center gap-2 bg-white rounded-lg px-2">
                            <label
                                htmlFor="colorPicker"
                                className="p-2 rounded cursor-pointer text-sm font-medium w-full text-center flex items-center justify-center"
                                style={{
                                    backgroundColor: color,
                                    color: contrastColor,
                                }}
                            >
                                <FaPalette className="mr-2" />
                                <span className="hidden md:inline">
                                    Choose Space Color
                                </span>
                            </label>
                            <input
                                id="colorPicker"
                                type="color"
                                value={color}
                                onChange={handleColorChange}
                                className="w-10 h-10 cursor-pointer"
                                style={{
                                    backgroundColor: color,
                                    visibility: 'hidden',
                                    width: '0',
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-md"
                            style={{
                                backgroundColor: 'white',
                                color: 'black',
                                border: '1px solid black',
                            }}
                        >
                            Save
                        </button>
                        <button
                            className="btn btn-md btn-error text-white"
                            onClick={handleDelete}
                            style={{
                                border: `3px solid ${space.color}`,
                            }}
                        >
                            <FaTrash /> Delete Space
                        </button>
                    </form>
                </div>
            ) : (
                <div className="h-full flex flex-col justify-center ml-4">
                    <h2
                        className="text-2xl font-bold mb-2 line-clamp-2 break-words"
                        style={{
                            color: contrastColor,
                        }}
                    >
                        {name}
                    </h2>
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Stop the click event from bubbling up
                            setIsEditing(true); // Set editing state
                        }}
                        className="btn btn-sm btn-ghost absolute top-2 right-2"
                        style={{
                            color: contrastColor,
                        }}
                    >
                        Edit
                    </button>
                    <div className="flex flex-row justify-start items-center gap-4">
                        <div className="task-summary">
                            <div
                                className="flex flex-col bg-opacity-80 p-4 rounded-lg shadow-md"
                                style={{
                                    backgroundColor: 'white',
                                    border: `1px solid black`,
                                    color: 'black',
                                }}
                            >
                                <h4 className="text-lg font-semibold mb-2">
                                    {tasks.length} Tasks
                                </h4>
                                <p className="text-sm grid md:grid-cols-1 lg:grid-cols-2 gap-2">
                                    {tasks.filter(
                                        (task) =>
                                            task.progress === 'Not Started'
                                    ).length > 0 && (
                                        <div className="font-medium px-2 border border-gray-300 rounded-md">
                                            <span className="font-bold ">
                                                {
                                                    tasks.filter(
                                                        (task) =>
                                                            task.progress ===
                                                            'Not Started'
                                                    ).length
                                                }
                                            </span>{' '}
                                            Not Started
                                        </div>
                                    )}
                                    {tasks.filter(
                                        (task) =>
                                            task.progress === 'In Progress'
                                    ).length > 0 && (
                                        <div className="font-medium px-2 border border-yellow-500 rounded-md">
                                            <span className="font-bold ">
                                                {
                                                    tasks.filter(
                                                        (task) =>
                                                            task.progress ===
                                                            'In Progress'
                                                    ).length
                                                }
                                            </span>{' '}
                                            In Progress
                                        </div>
                                    )}
                                    {tasks.filter(
                                        (task) => task.progress === 'Blocked'
                                    ).length > 0 && (
                                        <div className="font-medium px-2 border border-red-500 rounded-md">
                                            <span className="font-bold ">
                                                {
                                                    tasks.filter(
                                                        (task) =>
                                                            task.progress ===
                                                            'Blocked'
                                                    ).length
                                                }
                                            </span>{' '}
                                            Blocked
                                        </div>
                                    )}
                                    {tasks.filter(
                                        (task) => task.progress === 'Complete'
                                    ).length > 0 && (
                                        <div className="font-medium px-2 border border-green-500 rounded-md">
                                            <span className="font-bold ">
                                                {
                                                    tasks.filter(
                                                        (task) =>
                                                            task.progress ===
                                                            'Complete'
                                                    ).length
                                                }
                                            </span>{' '}
                                            Completed
                                        </div>
                                    )}
                                </p>

                                {tasksDueToday.length > 0 && (
                                    <div>
                                        <div
                                            className="w-full h-0 border-b-2 border-black/50 border-dashed my-2"
                                            style={{
                                                opacity: 0.5,
                                            }}
                                        />
                                        <div className="font-xs font-semibold px-4 my-1 flex flex-row items-center gap-2">
                                            <FaClock className="text-red-500/80" />
                                            {tasksDueToday.length} due today
                                        </div>
                                    </div>
                                )}
                                {tasksDueThisWeek.length > 0 && (
                                    <div className="font-xs font-semibold px-4 flex flex-row items-center gap-2">
                                        <FaClock className="text-yellow-500/80" />
                                        {tasksDueThisWeek.length} due this week
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteConfirm && (
                <ConfirmDelete
                    objectToDelete={space}
                    spaceOrTask="space"
                    cancelDelete={cancelDelete}
                />
            )}
        </div>
    );
};

export default SpaceCard;
