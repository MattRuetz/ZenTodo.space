import React, {
    forwardRef,
    ForwardedRef,
    useMemo,
    useCallback,
    useState,
    useEffect,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { Task } from '@/types';
import SubtaskDrawerCard from './SubtaskDrawerCard';
import { FaAngleRight, FaXmark } from 'react-icons/fa6';
import { setSubtaskDrawerParentId } from '@/store/uiSlice';
import SubtaskDropZone from './SubtaskDropZone';
import SortingDropdown from './SortingDropdown';
import SimplicityModal from '../SimplicityModal';
import { setSimplicityModalOpen } from '@/store/uiSlice';

interface SubtaskDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const SubtaskDrawer = React.memo(
    forwardRef<HTMLDivElement, SubtaskDrawerProps>(
        (
            { isOpen, onClose }: SubtaskDrawerProps,
            ref: ForwardedRef<HTMLDivElement>
        ) => {
            const dispatch = useDispatch<AppDispatch>();

            const isSimplicityModalOpen = useSelector(
                (state: RootState) => state.ui.isSimplicityModalOpen
            );

            const isGlobalDragging = useSelector(
                (state: RootState) => state.ui.isGlobalDragging
            );
            const sortOption = useSelector(
                (state: RootState) => state.ui.sortOption
            );
            const isReversed = useSelector(
                (state: RootState) => state.ui.isReversed
            );
            const parentTaskId = useSelector(
                (state: RootState) => state.ui.subtaskDrawerParentId
            );
            const allTasks = useSelector(
                (state: RootState) => state.tasks.tasks
            );

            const parentTask = useMemo(() => {
                if (!parentTaskId) return null;
                return allTasks.find((t) => t._id === parentTaskId);
            }, [allTasks, parentTaskId]);

            const allSubtasksOfParent = useMemo(() => {
                if (!parentTask) return [];
                return parentTask.subtasks
                    .map((subtaskId) =>
                        allTasks.find((task) => task._id === subtaskId)
                    )
                    .filter((task): task is Task => task !== undefined);
            }, [allTasks, parentTask]);

            const grandparentTask = useMemo(() => {
                if (!parentTask?.parentTask) return null;
                return allTasks.find((t) => t._id === parentTask?.parentTask);
            }, [allTasks, parentTask]);

            const handleSwitchParentTask = useCallback(
                (task: Task) => {
                    dispatch(setSubtaskDrawerParentId(task._id ?? ''));
                },
                [dispatch]
            );

            const sortedSubtasks = useMemo(() => {
                let sorted = [...allSubtasksOfParent];
                switch (sortOption) {
                    case 'name':
                        sorted.sort((a, b) =>
                            a.taskName.localeCompare(b.taskName)
                        );
                        break;
                    case 'progress':
                        sorted.sort((a, b) =>
                            a.progress.localeCompare(b.progress)
                        );
                        break;
                    case 'created':
                        sorted.sort(
                            (a, b) =>
                                new Date(b.createdAt as Date).getTime() -
                                new Date(a.createdAt as Date).getTime()
                        );
                        break;
                    case 'lastEdited':
                        sorted.sort(
                            (a, b) =>
                                new Date(b.updatedAt as Date).getTime() -
                                new Date(a.updatedAt as Date).getTime()
                        );
                        break;
                    default:
                        break;
                }
                if (isReversed) {
                    sorted.reverse();
                }
                return sorted;
            }, [allSubtasksOfParent, sortOption, isReversed]);

            const [isTaskCardOver, setIsTaskCardOver] = useState(false);

            useEffect(() => {
                const handleMouseMove = (e: MouseEvent) => {
                    if (!isGlobalDragging) {
                        setIsTaskCardOver(false);
                        return;
                    }
                    if (ref && 'current' in ref && ref.current) {
                        const rect = ref.current.getBoundingClientRect();
                        const isOver =
                            e.clientX >= rect.left &&
                            e.clientX <= rect.right &&
                            e.clientY >= rect.top &&
                            e.clientY <= rect.bottom;
                        setIsTaskCardOver(isOver);
                    }
                };
                document.addEventListener('mousemove', handleMouseMove);

                return () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                };
            }, [isTaskCardOver, isGlobalDragging]);

            useEffect(() => {
                // Check if there are no subtasks and close the drawer
                if (isOpen && sortedSubtasks.length === 0) {
                    if (grandparentTask) {
                        handleSwitchParentTask(grandparentTask as Task);
                    } else {
                        onClose();
                    }
                }
            }, [isOpen, sortedSubtasks, isGlobalDragging]);

            return (
                <div
                    ref={ref}
                    data-drawer-parent-id={parentTask?._id}
                    className={`subtask-drawer fixed top-0 right-0 h-full shadow-md transform w-[400px] border-l-2 bg-base-300 opacity-90 ${
                        isOpen ? '' : 'translate-x-full'
                    } transition-transform duration-300 ease-in-out subtask-drawer-items ${
                        isTaskCardOver
                            ? 'border-blue-700 filter brightness-125'
                            : 'border-transparent'
                    }`}
                    style={isTaskCardOver ? { zIndex: 1 } : { zIndex: 9999 }}
                >
                    <SimplicityModal
                        isOpen={isSimplicityModalOpen}
                        onClose={() => dispatch(setSimplicityModalOpen(false))}
                    />
                    <div className="p-3 subtask-drawer-items">
                        <div className="flex flex-row justify-between items-center py-2 bg-base-100 px-3 rounded-md">
                            <h2 className="text-lg font-bold uppercase subtask-drawer-items text-center w-full">
                                Subtasks
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-red-500 flex items-center gap-1 subtask-drawer-items hover:text-white hover:bg-red-500 rounded-full transition-colors duration-300 p-1"
                            >
                                <FaXmark className="text-sm" />
                            </button>
                        </div>
                        <div className="flex flex-row gap-2 w-full pt-2">
                            <p className="uppercase text-xs">Main Task:</p>
                        </div>
                        <div className="flex items-center gap-2 py-2 text-sm text-slate-300">
                            <div className="flex flex-row items-center gap-2 w-full text-sm text-slate-300">
                                {grandparentTask && (
                                    <>
                                        <p
                                            className="p-2 shadow-sm shadow-slate-950 hover:text-white bg-gradient-to-r from-sky-800 to-sky-900 hover:from-sky-600 hover:to-sky-700 rounded-md cursor-pointer w-full max-w-32 break-words overflow-wrap-anywhere"
                                            onClick={() =>
                                                handleSwitchParentTask(
                                                    grandparentTask as Task
                                                )
                                            }
                                        >
                                            {grandparentTask?.taskName}
                                        </p>
                                        <FaAngleRight
                                            className="text-sm text-slate-700"
                                            size={24}
                                        />
                                    </>
                                )}
                                <>
                                    <p
                                        className="p-2 rounded-md cursor-default max-w-32 bg-slate-700/50 w-full break-words overflow-wrap-anywhere"
                                        onClick={() =>
                                            handleSwitchParentTask(
                                                parentTask as Task
                                            )
                                        }
                                    >
                                        {parentTask?.taskName}
                                    </p>
                                </>
                            </div>
                            <SortingDropdown />
                        </div>
                        <div className="flex flex-row gap-2 h-0.5 bg-base-100 w-full"></div>

                        <ul className="overflow-y-auto overflow-x-visible h-[calc(100vh-10rem)] subtask-drawer-items pt-2">
                            <SubtaskDropZone
                                position="start"
                                parentTask={parentTask as Task}
                            />
                            {sortedSubtasks.map((subtask, index) => (
                                <React.Fragment key={subtask?._id}>
                                    <SubtaskDrawerCard
                                        subtask={subtask as Task}
                                        position={subtask._id as string}
                                    />
                                    <SubtaskDropZone
                                        position={`after_${subtask._id}`}
                                        parentTask={parentTask as Task}
                                    />
                                </React.Fragment>
                            ))}
                        </ul>
                    </div>
                </div>
            );
        }
    )
);

SubtaskDrawer.displayName = 'SubtaskDrawer';

export default SubtaskDrawer;
