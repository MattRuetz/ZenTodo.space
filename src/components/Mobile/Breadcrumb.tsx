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
                                <span
                                    className="line-clamp-2 max-w-[130px] py-1 px-4 rounded-md"
                                    style={{
                                        backgroundColor: `var(--${currentTheme}-background-300)`,
                                        border: `1px solid var(--${currentTheme}-accent-blue)`,
                                    }}
                                >
                                    {grandparentTask.taskName}
                                </span>
                                <span className="mx-2">/</span>
                            </>
                        ) : null}
                        <span
                            className="line-clamp-2 max-w-[130px] py-1 px-4 rounded-md"
                            style={{
                                border: `1px solid var(--${currentTheme}-accent-grey)`,
                            }}
                        >
                            {currentParent.taskName}
                        </span>
                        <span className="mx-2">/</span>
                    </button>
                </div>
            )}
        </>
    );
};

export default Breadcrumb;
