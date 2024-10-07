import React, { useMemo } from 'react';
import { Task } from '@/types';
import { FaAngleLeft, FaAngleRight, FaSlash } from 'react-icons/fa';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { useTheme } from '@/hooks/useTheme';
import {
    FaArrowLeft,
    FaLine,
    FaPersonWalkingDashedLineArrowRight,
} from 'react-icons/fa6';
interface BreadcrumbProps {
    currentParent: Task | null;
    onBack: () => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentParent, onBack }) => {
    const allTasks = useSelector((state: RootState) => state.tasks.tasks);
    const currentTheme = useTheme();

    const parentTask = useMemo(() => {
        if (!currentParent) return null;
        return allTasks.find((t) => t._id === currentParent._id);
    }, [allTasks, currentParent]);

    const grandparentTask = useMemo(() => {
        if (!parentTask?.parentTask) return null;
        return allTasks.find((t) => t._id === parentTask?.parentTask);
    }, [allTasks, parentTask]);

    return (
        <>
            {currentParent && (
                <div
                    className="breadcrumb flex items-center"
                    style={{
                        color: `var(--${currentTheme}-text-default)`,
                    }}
                >
                    <button
                        onClick={onBack}
                        className="back-button flex items-center text-xs"
                    >
                        <FaArrowLeft className="mr-2" />
                        {grandparentTask ? (
                            <>
                                <p
                                    className="max-w-[120px] py-1 px-2 rounded-md truncate"
                                    style={{
                                        backgroundColor: `var(--${currentTheme}-background-300)`,
                                        border: `1px solid var(--${currentTheme}-accent-blue)`,
                                    }}
                                >
                                    {grandparentTask.taskName}
                                </p>
                                <span className="mx-2">/</span>
                            </>
                        ) : null}
                        <span
                            className="max-w-[120px] py-1 px-2 rounded-md truncate"
                            style={{
                                border: `1px solid var(--${currentTheme}-accent-grey)`,
                            }}
                        >
                            {currentParent.taskName}
                        </span>
                        <span className="mx-2">/</span>
                    </button>
                    <p className="text-xs uppercase font-semibold">subtasks</p>
                </div>
            )}
        </>
    );
};

export default Breadcrumb;
