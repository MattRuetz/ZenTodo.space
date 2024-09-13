import React from 'react';

interface SimplicityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SimplicityModal: React.FC<SimplicityModalProps> = ({
    isOpen,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 cursor-default">
            <div className="bg-gradient-to-br from-slate-200 to-slate-400 p-8 rounded-lg shadow-lg max-w-md w-full w-11/12">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                    Keep It Simple
                </h2>
                <p className="mb-4 text-gray-700 text-sm text-center">
                    We recommend a maximum of 3 levels to maintain clarity and
                    focus in your task organization.
                </p>
                <p className="mb-4 text-gray-700 text-sm text-center">
                    If you need more depth, consider reorganizing your tasks.
                    Here are some tips:
                </p>
                <ul className="list-disc list-inside mb-4 text-gray-700">
                    <li>
                        Break complex tasks into smaller, manageable subtasks
                    </li>
                    <li>
                        Use tags or labels to group related tasks across
                        different levels
                    </li>
                    <li>
                        Consider if some subtasks could be separate main tasks
                    </li>
                </ul>
                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SimplicityModal;
