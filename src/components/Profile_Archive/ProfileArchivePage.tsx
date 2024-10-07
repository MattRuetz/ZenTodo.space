import React, { useState } from 'react';
import ProfileSettings from './ProfileSettings';
import ArchivedTasks from './ArchivedTasks';
import { useTheme } from '@/hooks/useTheme';
import { AnimatePresence, motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import { FaArchive, FaArrowLeft, FaUser } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import BottomSettings from '../SuperSpace/BottomSettings';

interface ProfileArchivePageProps {
    activeTabStart: string;
}

const ProfileArchivePage: React.FC<ProfileArchivePageProps> = ({
    activeTabStart,
}) => {
    const [activeTab, setActiveTab] = useState(activeTabStart);
    const theme = useTheme();
    const router = useRouter();

    return (
        <div
            className="mx-auto p-2 sm:p-4 w-full h-screen flex flex-col"
            style={{
                backgroundColor: `var(--${theme}-space-background)`,
            }}
        >
            <div className="mb-4 relative">
                <button
                    data-tooltip-id="return-to-super-space-tooltip"
                    className="btn btn-circle px-3 py-2 sm:px-4 sm:py-2 rounded-full flex items-center hover:scale-105 hover:brightness-125 transition-all duration-300"
                    style={{
                        color: `var(--${theme}-text-default)`,
                        backgroundColor: `var(--${theme}-background-100)`,
                    }}
                    onClick={() => router.back()}
                    aria-label="Return"
                >
                    <FaArrowLeft className="text-lg sm:text-xl" />
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
                className="container max-w-screen-lg mx-auto rounded-lg overflow-hidden shadow-xl flex-grow flex flex-col mb-12 h-full"
                style={{
                    backgroundColor: `var(--${theme}-background-100)`,
                    border: `2px solid var(--${theme}-card-border-color)`,
                }}
            >
                <div
                    className="grid grid-cols-2 gap-0 font-bold"
                    style={{
                        backgroundColor: `var(--${theme}-background-100)`,
                        color: `var(--${theme}-text-default)`,
                    }}
                >
                    {['profile', 'archive'].map((tab) => (
                        <div
                            key={tab}
                            className="px-2 sm:px-4 py-2 text-center cursor-pointer flex items-center justify-center text-sm sm:text-base"
                            style={
                                activeTab === tab
                                    ? {
                                          backgroundColor: `var(--${theme}-background-200)`,
                                      }
                                    : {
                                          backgroundColor: `var(--${theme}-background-100)`,
                                          borderBottom: `2px solid var(--${theme}-background-200)`,
                                      }
                            }
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'profile' ? (
                                <>
                                    <FaUser className="mr-1 sm:mr-2" /> My
                                    Profile
                                </>
                            ) : (
                                <>
                                    <FaArchive className="mr-1 sm:mr-2" />{' '}
                                    Archived Tasks
                                </>
                            )}
                        </div>
                    ))}
                </div>
                <div className="w-full flex-grow overflow-hidden h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.2 }}
                            className="h-full overflow-y-auto"
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
            <BottomSettings />
        </div>
    );
};

export default ProfileArchivePage;
