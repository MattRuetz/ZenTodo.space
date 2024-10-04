import { FaCalendar, FaCopy, FaPlus, FaTag, FaTrash } from 'react-icons/fa6';
import { SpaceData, TaskProgress } from '@/types';
import { FaArrowsAlt, FaEllipsisV, FaInfoCircle } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { TaskDetails } from '../TaskDetails';
import { TaskDueDatePicker } from '../TaskCards/TaskDueDatePicker';
import { DueDateIndicator } from '../TaskCards/DueDateIndicator';
import { useAddNewSubtask } from '@/hooks/useAddNewSubtask';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import EmojiDropdown from '../EmojiDropdown';
import { moveTaskToSpace, updateTask } from '@/store/tasksSlice';
import { updateSpaceTaskOrderAsync } from '@/store/spaceSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import ConfirmDelete from '../TaskCards/ConfirmDelete';
import useClickOutside from '@/hooks/useClickOutside';
import { useTheme } from '@/hooks/useTheme';
import TaskListItemMenu from './TaskListItemMenu';
import { useChangeHierarchy } from '@/hooks/useChangeHierarchy';
import { useAlert } from '@/hooks/useAlert';
import { useDuplicateTask } from '@/hooks/useDuplicateTask';

interface TaskListItemTopBarProps {
    task: any;
    handleProgressChange: (TaskProgress: TaskProgress) => void;
    handleSetDueDate: (dueDate: Date | undefined) => void;
    isMenuOpen: boolean;
    setIsMenuOpen: (isMenuOpen: boolean) => void;
}

export const TaskListItemTopBar = ({
    task,
    handleProgressChange,
    handleSetDueDate,
    isMenuOpen,
    setIsMenuOpen,
}: TaskListItemTopBarProps) => {
    const currentTheme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { convertSubtaskToTask } = useChangeHierarchy();
    const { showAlert } = useAlert();
    const { duplicateTask } = useDuplicateTask();
    const [showDetails, setShowDetails] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showMoveOptions, setShowMoveOptions] = useState(false);

    const tasksState = useSelector((state: RootState) => state.tasks.tasks);
    const spacesState = useSelector((state: RootState) => state.spaces.spaces);

    const menuRef = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const moveOptionsRef = useRef<HTMLDivElement>(null);
    const currentSpaceId = useSelector(
        (state: RootState) => state.spaces.currentSpace?._id
    );

    const {
        initiateDeleteTask,
        cancelDelete,
        showDeleteConfirm,
        taskToDelete,
    } = useDeleteTask();

    useClickOutside([menuRef], () => setIsMenuOpen(false));
    useClickOutside([moveOptionsRef], () => setShowMoveOptions(false));
    useClickOutside([datePickerRef], () => setShowDatePicker(false));

    const openMenu = (id: string) => {
        setIsMenuOpen(true);
    };

    const handleShowDetails = () => {
        setShowDetails(true);
        setIsMenuOpen(false);
    };

    const { addNewSubtask } = useAddNewSubtask();

    const handleAddSubtask = () => {
        addNewSubtask({
            subtask: {
                taskName: 'New Subtask',
                taskDescription: '',
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                subtasks: [],
                zIndex: 0,
                progress: 'Not Started',
                space: currentSpaceId || '',
            },
            parentId: task._id,
            position: 'start',
        });
    };

    const handleSetTaskEmoji = (emoji: string) => {
        if (task._id) {
            dispatch(updateTask({ _id: task._id, emoji: emoji }));
        }
    };

    const handleDuplicateTask = () => {
        const space = spacesState.find((space) => space._id === task.space);
        duplicateTask(task, tasksState).then((newTask) => {
            if (space && newTask[0]._id) {
                dispatch(
                    updateSpaceTaskOrderAsync({
                        spaceId: space._id!,
                        taskOrder: [...space.taskOrder, newTask[0]._id],
                    })
                );
            }
        });
    };

    const handleDeleteTask = () => {
        initiateDeleteTask(task._id);
    };

    const handleMakeMainTask = () => {
        convertSubtaskToTask(task, {
            x: Math.floor(Math.random() * 600) + 1,
            y: Math.floor(Math.random() * 600) + 1,
        }).then(() => {
            showAlert('Moved to main tasks!', 'success');
        });
    };

    const handleMoveTask = (spaceId: string) => {
        const space = spacesState.find((space) => space._id === spaceId);
        if (!space) return;

        dispatch(moveTaskToSpace({ taskId: task._id!, spaceId }));
        dispatch(
            updateSpaceTaskOrderAsync({
                spaceId,
                taskOrder: [...space.taskOrder, task._id!],
            })
        ).then(() => {
            showAlert('Task moved successfully', 'notice');
        });
    };

    return (
        <div
            className="flex justify-between items-top gap-2 h-auto pb-2"
            style={{
                color: `var(--${currentTheme}-emphasis-light)`, // Use theme color
            }}
        >
            {showDetails && (
                <TaskDetails task={task} setShowDetails={setShowDetails} />
            )}
            {showDatePicker && (
                <TaskDueDatePicker
                    onSetDueDate={handleSetDueDate}
                    setShowDatePicker={setShowDatePicker}
                    setIsMenuOpen={setIsMenuOpen}
                    datePickerRef={datePickerRef}
                    task={task}
                />
            )}
            {isMenuOpen && (
                <div
                    className="absolute top-0 right-0 w-48 rounded-md shadow-lg z-10"
                    ref={menuRef}
                >
                    <TaskListItemMenu
                        isMenuOpen={isMenuOpen}
                        currentTheme={currentTheme}
                        handleShowDetails={handleShowDetails}
                        setShowDatePicker={setShowDatePicker}
                        setIsMenuOpen={setIsMenuOpen}
                        setShowMoveOptions={setShowMoveOptions}
                        onAddSubtask={handleAddSubtask}
                        onDuplicateTask={handleDuplicateTask}
                        onDelete={handleDeleteTask}
                        onMakeMainTask={handleMakeMainTask}
                        isSubtask={task.parentTask ? true : false}
                    />
                </div>
            )}
            {showDeleteConfirm && taskToDelete && (
                <ConfirmDelete
                    objectToDelete={taskToDelete}
                    cancelDelete={cancelDelete}
                    spaceOrTask={'task'}
                />
            )}
            {showMoveOptions && (
                <div
                    ref={moveOptionsRef}
                    className="absolute right-0 top-8 mt-2 w-48 rounded-md shadow-lg z-10"
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`,
                        border: `1px solid var(--${currentTheme}-accent-grey)`,
                    }}
                >
                    <div className="py-2 px-4">Move to different space:</div>
                    <ul>
                        {spacesState
                            .filter(
                                (space: SpaceData) => space._id !== task.space
                            )
                            .map((space: SpaceData) => (
                                <li
                                    key={space._id}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-black/20 cursor-pointer"
                                    onClick={() =>
                                        handleMoveTask(space._id || '')
                                    }
                                >
                                    <div
                                        className="w-3 h-3 rounded-full border border-white"
                                        style={{
                                            backgroundColor: space.color,
                                        }}
                                    ></div>
                                    {space.name}
                                </li>
                            ))}
                    </ul>
                </div>
            )}
            <EmojiDropdown
                taskEmoji={task.emoji || <FaTag />}
                setTaskEmoji={handleSetTaskEmoji}
                inSubtaskDrawer={true}
            />
            <div className="flex justify-between items-center gap-2">
                {task.dueDate && (
                    <DueDateIndicator
                        task={task}
                        handleDueDateClick={() => setShowDatePicker(true)}
                    />
                )}
                <FaEllipsisV
                    className="cursor-pointer"
                    style={{
                        color: `var(--${currentTheme}-emphasis-light)`, // Use theme color
                    }}
                    onClick={() => openMenu(task._id as string)}
                />
            </div>
        </div>
    );
};
