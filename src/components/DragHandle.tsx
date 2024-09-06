// src/components/icons/DragHandle.tsx
import React from 'react';

interface DragHandleProps {
    className?: string;
}

const DragHandle: React.FC<DragHandleProps> = ({ className = '' }) => {
    return (
        <div
            className={`drag-handle cursor-move bg-base-400 rounded-t flex items-center ${className}`}
        >
            <div className="w-full justify-center">
                <div
                    className="mb-1 w-full bg-sky-950"
                    style={{ height: '1px' }}
                ></div>
                <div
                    className="mb-1 w-full bg-sky-950"
                    style={{ height: '1px' }}
                ></div>
                <div
                    className="mb-1 w-full bg-sky-950"
                    style={{ height: '1px' }}
                ></div>
            </div>
        </div>
    );
};

export default DragHandle;
