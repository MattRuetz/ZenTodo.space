import React from 'react';
import { useTheme } from '@/hooks/useTheme';
interface SimplicityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SimplicityModal: React.FC<SimplicityModalProps> = React.memo(
    ({ isOpen, onClose }) => {
        const currentTheme = useTheme();
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 cursor-default">
                <div
                    className="p-8 rounded-lg shadow-lg max-w-md w-11/12"
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
                    }}
                >
                    <h2
                        className="text-2xl font-bold mb-4 text-center"
                        style={{
                            color: `var(--${currentTheme}-text-default)`, // Use theme color
                        }}
                    >
                        Keep It Simple
                    </h2>
                    <p
                        className="mb-4 text-sm text-center"
                        style={{
                            color: `var(--${currentTheme}-text-subtle)`, // Use theme color
                        }}
                    >
                        We recommend a maximum of 3 levels to maintain clarity
                        and focus in your task organization.
                    </p>
                    <p
                        className="mb-4 text-sm text-center"
                        style={{
                            color: `var(--${currentTheme}-text-subtle)`, // Use theme color
                        }}
                    >
                        If you need more depth, consider reorganizing your
                        tasks. Here are some tips:
                    </p>
                    <ul
                        className="list-disc list-inside mb-4"
                        style={{ color: `var(--${currentTheme}-text-subtle)` }}
                    >
                        <li>
                            Break complex tasks into smaller, manageable
                            subtasks
                        </li>
                        <li>
                            Consider if some subtasks could be separate main
                            tasks
                        </li>
                        <li>
                            Use emoji tags to group related main-level tasks
                        </li>
                    </ul>
                    <div className="flex justify-center">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg transition duration-200"
                            style={{
                                backgroundColor: `var(--${currentTheme}-accent-blue)`, // Use theme color
                                color: `var(--${currentTheme}-text-default)`, // Use theme color
                            }}
                        >
                            Got it, thanks!
                        </button>
                    </div>
                </div>
            </div>
        );
    }
);

export default SimplicityModal;
