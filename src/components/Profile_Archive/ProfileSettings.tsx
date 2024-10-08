import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';
import { useUser, useAuth } from '@clerk/nextjs';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchUser, setUser, updateUserData } from '@/store/userSlice';
// import { User } from '@clerk/backend';
import { User } from '@/types';
import { getQuoteForDay } from '@/hooks/useQuoteForDay';
import { FaEnvelope, FaPencil, FaSpinner } from 'react-icons/fa6';
import {
    FaAward,
    FaCheckCircle,
    FaList,
    FaSignOutAlt,
    FaSpaceShuttle,
} from 'react-icons/fa';
import { formatUserSince } from '@/app/utils/dateUtils';
import { fetchTheme } from '@/store/themeSlice';

const ProfileSettings = () => {
    const currentTheme = useTheme();
    const { isLoaded, isSignedIn, user: clerkUser } = useUser();
    const userMetadata = useSelector(
        (state: RootState) => state.user?.user ?? null
    );
    const { signOut } = useAuth();
    const dispatch = useDispatch<AppDispatch>();
    const [profilePicture, setProfilePicture] = useState(
        clerkUser?.imageUrl || '/images/profile_picture_default.webp'
    );
    const [name, setName] = useState(clerkUser?.fullName || '');
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const quote = getQuoteForDay();

    useEffect(() => {
        if (clerkUser) {
            setProfilePicture(
                clerkUser.imageUrl || '/images/profile_picture_default.webp'
            );
            setName(clerkUser.fullName || '');
        }
    }, [clerkUser]);

    const handleProfilePictureChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (file && clerkUser) {
            setIsUploadingPhoto(true);
            try {
                // Update Clerk user profile
                await clerkUser.setProfileImage({ file: file });

                // Update local state
                setProfilePicture(clerkUser.imageUrl || '');
                setIsUploadingPhoto(false);

                // Update Redux store
                dispatch(
                    updateUserData({
                        userData: { imageUrl: clerkUser.imageUrl },
                    })
                );
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                setIsUploadingPhoto(false);
            }
        }
    };

    const handleUpdate = async (updateData: Partial<User>) => {
        try {
            if (clerkUser) {
                await clerkUser.update({
                    firstName: updateData.fullName || '',
                });
                dispatch(updateUserData({ userData: updateData }));
            }
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(false);
        await handleUpdate({ fullName: name });
    };

    // if (isLoading) {
    //     return <ComponentSpinner />;
    // }

    return (
        <div className="flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto">
            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative flex flex-col items-center">
                        <div className="w-40 h-40 md:w-48 md:h-48 sm:w-64 sm:h-64 relative">
                            <Image
                                src={profilePicture}
                                alt="Profile Picture"
                                layout="fill"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                objectFit="cover"
                                className="rounded-full shadow-md"
                                style={{
                                    backgroundColor: `var(--${currentTheme}-background-300)`,
                                }}
                            />
                            {isUploadingPhoto && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                    <span className="loading loading-ring text-slate-200 h-12 w-12"></span>
                                </div>
                            )}
                            <button
                                className="absolute top-0 left-0 btn p-2 rounded-full w-12 h-12"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                    border: `3px solid var(--${currentTheme}-background-100)`,
                                    backgroundColor: `var(--${currentTheme}-background-200)`,
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingPhoto}
                            >
                                {isUploadingPhoto ? '...' : <FaPencil />}
                            </button>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            disabled={isUploadingPhoto}
                        />
                    </div>
                    <div className="flex flex-col justify-center space-y-4">
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Name"
                                    className="w-full p-2 rounded"
                                />
                                <button
                                    type="submit"
                                    className="btn btn-sm p-2 rounded flex items-center justify-center gap-2 text-xs w-full"
                                    style={{
                                        backgroundColor: `var(--${currentTheme}-background-200)`,
                                        color: `var(--${currentTheme}-text-subtle)`,
                                    }}
                                >
                                    Update Profile
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <h3
                                    className="font-semibold text-xl"
                                    style={{
                                        color: `var(--${currentTheme}-text-default)`,
                                    }}
                                >
                                    {clerkUser?.fullName}
                                </h3>
                                <h3
                                    className="font-semibold text-sm flex items-center gap-2"
                                    style={{
                                        color: `var(--${currentTheme}-text-default)`,
                                    }}
                                >
                                    <FaEnvelope className="w-4 h-4" />{' '}
                                    {
                                        clerkUser?.primaryEmailAddress
                                            ?.emailAddress
                                    }
                                </h3>
                                {clerkUser?.createdAt && (
                                    <p
                                        className="text-sm flex items-center p-2 rounded"
                                        style={{
                                            color: `var(--${currentTheme}-text-subtle)`,
                                            backgroundColor: `var(--${currentTheme}-background-300)`,
                                        }}
                                    >
                                        <FaAward className="mr-2" />
                                        User since{' '}
                                        {formatUserSince(
                                            new Date(clerkUser.createdAt)
                                        )}
                                    </p>
                                )}
                                <button
                                    className="btn btn-sm p-2 hover:border-white/25 flex items-center justify-center gap-2 text-xs w-full"
                                    style={{
                                        backgroundColor: `var(--${currentTheme}-background-200)`,
                                        color: `var(--${currentTheme}-text-default)`,
                                    }}
                                    onClick={() => setIsEditing(true)}
                                >
                                    <FaPencil className="w-4 h-4 text-sm" />
                                    Edit Name / Password
                                </button>
                                <button
                                    className="btn btn-sm p-2 hover:border-white/25 flex items-center justify-center gap-2 text-xs w-full hover:brightness-90"
                                    style={{
                                        color: `var(--${currentTheme}-text-default)`,
                                        backgroundColor: `var(--${currentTheme}-background-100)`,
                                    }}
                                    onClick={() => signOut()}
                                >
                                    <FaSignOutAlt /> Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <hr
                className="w-full h-px my-6 border-0 rounded"
                style={{
                    backgroundColor: `var(--${currentTheme}-background-200)`,
                }}
            />
            <div className="quote-of-the-day p-4 text-center max-w-md text-sm mb-4 w-full hover:cursor-default">
                <blockquote
                    className="text-md italic hover:scale-105 transition-all duration-300"
                    style={{ color: `var(--${currentTheme}-text-default)` }}
                >
                    {quote}
                </blockquote>
            </div>
            <div
                className="flex flex-col items-center justify-between space-y-4 p-4 rounded-lg w-full"
                style={{
                    backgroundColor: `var(--${currentTheme}-background-200)`,
                }}
            >
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-lg"
                    style={{ color: `var(--${currentTheme}-text-default)` }}
                >
                    <div className="flex items-center justify-center gap-4">
                        <FaSpaceShuttle className="w-6 h-6" />
                        <div>
                            <strong>Spaces:</strong>
                            <span className="ml-2">
                                {userMetadata?.spacesCount || 0}/9
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <FaList className="w-6 h-6" />
                        <div>
                            <strong>Tasks Created:</strong>
                            <span className="ml-2">
                                {userMetadata?.totalTasksCreated || 0}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <FaCheckCircle className="w-6 h-6" />
                        <div>
                            <strong>Completed:</strong>
                            <span className="ml-2">
                                {userMetadata?.tasksCompleted || 0}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <FaSpinner className="w-6 h-6" />
                        <div>
                            <strong>In Progress:</strong>
                            <span className="ml-2">
                                {userMetadata?.tasksInProgress || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
