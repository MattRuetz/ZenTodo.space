import React, { useState } from 'react';
import ProfileSettings from './ProfileSettings';
import ArchivedTasks from './ArchivedTasks';
import { useTheme } from '@/hooks/useTheme';
import { AnimatePresence, motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';

interface ProfileArchivePageProps {
    setIsProfilePageOpen: (isProfilePageOpen: boolean) => void;
}

const ProfileArchivePage: React.FC<ProfileArchivePageProps> = ({
    setIsProfilePageOpen,
}) => {
    const [activeTab, setActiveTab] = useState('profile');
    const theme = useTheme();
    return (
        <div
            className="mx-auto p-4 w-full min-h-screen"
            style={{
                backgroundColor: `var(--${theme}-space-background)`,
            }}
        >
            <div className="justify-start mb-4 relative">
                <button
                    data-tooltip-id="return-to-super-space-tooltip"
                    className="btn btn-ghost px-4 py-2 rounded-full flex items-center hover:scale-105 hover:brightness-125 transition-all duration-300"
                    style={{
                        color: `var(--${theme}-emphasis-light)`,
                        backgroundColor: `var(--${theme}-background-100)`,
                    }}
                    onClick={() => setIsProfilePageOpen(false)}
                    aria-label="Return"
                >
                    <span className="text-xl">↩</span>
                </button>
                <Tooltip
                    id="return-to-super-space-tooltip"
                    style={{
                        backgroundColor: 'white',
                        color: 'black',
                    }}
                >
                    Return to Space
                </Tooltip>
            </div>

            <div
                className="container max-w-screen-lg mx-auto rounded-lg overflow-hidden"
                style={{
                    backgroundColor: `var(--${theme}-background-100)`,
                }}
            >
                <div
                    className="grid grid-cols-2 gap-0"
                    style={{
                        backgroundColor: `var(--${theme}-background-100)`,
                    }}
                >
                    <div
                        className="px-4 py-2 text-center cursor-pointer"
                        style={
                            activeTab === 'profile'
                                ? {
                                      backgroundColor: `var(--${theme}-background-200)`,
                                  }
                                : {
                                      backgroundColor: `var(--${theme}-background-100)`,
                                      borderBottom: `2px solid var(--${theme}-background-200)`,
                                  }
                        }
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Settings
                    </div>
                    <div
                        className="px-4 py-2 text-center cursor-pointer"
                        style={
                            activeTab === 'archive'
                                ? {
                                      backgroundColor: `var(--${theme}-background-200)`,
                                  }
                                : {
                                      backgroundColor: `var(--${theme}-background-100)`,
                                      borderBottom: `2px solid var(--${theme}-background-200)`,
                                  }
                        }
                        onClick={() => setActiveTab('archive')}
                    >
                        Archived Tasks
                    </div>
                </div>
                <div className="w-full h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.2 }}
                            className="h-[600px] overflow-y-auto"
                        >
                            {activeTab === 'profile' ? (
                                <ProfileSettings />
                            ) : (
                                <ArchivedTasks />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ProfileArchivePage;
