import React, { useState } from 'react';
import ProfileSettings from './ProfileSettings';
import ArchivedTasks from './ArchivedTasks';

interface ProfileArchivePageProps {
    setIsProfilePageOpen: (isProfilePageOpen: boolean) => void;
}

const ProfileArchivePage: React.FC<ProfileArchivePageProps> = ({
    setIsProfilePageOpen,
}) => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-start mb-4">
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => setIsProfilePageOpen(false)}
                >
                    Exit
                </button>
            </div>
            <div className="flex mb-4 justify-center">
                <button
                    className={`mr-4 px-4 py-2 rounded ${
                        activeTab === 'profile'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200'
                    }`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile Settings
                </button>
                <button
                    className={`px-4 py-2 rounded ${
                        activeTab === 'archive'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200'
                    }`}
                    onClick={() => setActiveTab('archive')}
                >
                    Archived Tasks
                </button>
            </div>

            <div className="mt-8">
                {activeTab === 'profile' ? (
                    <ProfileSettings />
                ) : (
                    <ArchivedTasks />
                )}
            </div>
        </div>
    );
};

export default ProfileArchivePage;
