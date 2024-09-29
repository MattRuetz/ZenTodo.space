import React from 'react';
import { Task } from '@/types';
import { FaAngleLeft } from 'react-icons/fa';

interface BreadcrumbProps {
    task: Task | null;
    onBack: () => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ task, onBack }) => {
    return (
        <div className="breadcrumb flex items-center">
            {task ? (
                <button
                    onClick={onBack}
                    className="back-button flex items-center"
                >
                    <FaAngleLeft className="mr-2" /> Back
                </button>
            ) : (
                <h2 className="text-lg font-bold">Main Tasks</h2>
            )}
        </div>
    );
};

export default Breadcrumb;
