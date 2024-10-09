import React from 'react';
import { useTheme } from '@/hooks/useTheme';

interface SimplicityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SimplicityModal: React.FC<SimplicityModalProps> = React.memo(
    ({ isOpen, onClose }) => {
        const currentTheme = useTheme();

        // Early return if the modal is not open
        if (!isOpen) return null;

        // Define styles based on the current theme
        const modalBackgroundColor = `var(--${currentTheme}-background-200)`;
        const textColor = `var(--${currentTheme}-text-default)`;
        const subtleTextColor = `var(--${currentTheme}-text-subtle)`;
        const accentColor = `var(--${currentTheme}-accent-blue)`;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 cursor-default">
                <div
                    className="p-8 rounded-lg shadow-lg max-w-md w-11/12"
                    style={{ backgroundColor: modalBackgroundColor }}
                >
                    <h2
                        className="text-2xl font-bold mb-4 text-center"
                        style={{ color: textColor }}
                    >
                        Keep It Simple
                    </h2>
                    <p
                        className="mb-4 text-sm text-center"
                        style={{ color: subtleTextColor }}
                    >
                        We recommend a maximum of 3 levels to maintain clarity
                        and focus in your task organization.
                    </p>
                    <p
                        className="mb-4 text-sm text-center"
                        style={{ color: subtleTextColor }}
                    >
                        If you need more depth, consider reorganizing your
                        tasks. Here are some tips:
                    </p>
                    <ul
                        className="list-disc list-inside mb-4"
                        style={{ color: subtleTextColor }}
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
                                backgroundColor: accentColor,
                                color: textColor,
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
