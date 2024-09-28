import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';
import { signOut, useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { setUser, updateUserData } from '@/store/userSlice';
import { User } from '@/types';
import { useEdgeStore } from '@/lib/edgestore';
import { getQuoteForDay } from '@/hooks/useQuoteForDay';
import {
    FaChampagneGlasses,
    FaEnvelope,
    FaPencil,
    FaSpinner,
} from 'react-icons/fa6';
import { ComponentSpinner } from '../ComponentSpinner';
import {
    FaAward,
    FaCalendarAlt,
    FaCheckCircle,
    FaList,
    FaSignOutAlt,
    FaSpaceShuttle,
} from 'react-icons/fa';
import { formatUserSince } from '@/app/utils/dateUtils';

const ProfileSettings = () => {
    const currentTheme = useTheme();
    const { data: session, update } = useSession();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user.user);
    const [profilePicture, setProfilePicture] = useState(
        user?.profilePicture || '/images/profile_picture_default.webp'
    );
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { edgestore } = useEdgeStore();

    const quote = getQuoteForDay();

    // Make sure the user is set in the redux store
    useEffect(() => {
        if (!user) {
            const fetchUserData = async () => {
                try {
                    setIsLoading(true);
                    const response = await fetch('/api/user');
                    if (response.ok) {
                        const userData = await response.json();
                        dispatch(setUser(userData));
                        setProfilePicture(
                            userData.profilePicture ||
                                '/images/profile_picture_default.webp'
                        );
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchUserData();
        } else {
            setIsLoading(false);
        }
    }, [dispatch, user]);

    const handleProfilePictureChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploadingPhoto(true);
            try {
                // Optimize the image
                const formData = new FormData();
                formData.append('file', file);
                const optimizeResponse = await fetch('/api/optimize-image', {
                    method: 'POST',
                    body: formData,
                });

                if (!optimizeResponse.ok) {
                    throw new Error('Failed to optimize image');
                }

                const optimizedBlob = await optimizeResponse.blob();
                const optimizedFile = new File([optimizedBlob], file.name, {
                    type: 'image/jpeg',
                });

                // Upload optimized file to EdgeStore
                const res = await edgestore.publicFiles.upload({
                    file: optimizedFile,
                });

                // Update profile picture URL in state immediately
                setProfilePicture(res.url);
                setIsUploadingPhoto(false);

                // Update user data in the database
                const updateData: Partial<User> = { profilePicture: res.url };
                const resultAction = await dispatch(updateUserData(updateData));
                if (updateUserData.fulfilled.match(resultAction)) {
                    await update({
                        ...session,
                        user: { ...session?.user, ...updateData },
                    });
                }

                // Delete the old profile picture asynchronously
                if (
                    user?.profilePicture &&
                    user.profilePicture !==
                        '/images/profile_picture_default.webp'
                ) {
                    edgestore.publicFiles
                        .delete({
                            url: user.profilePicture,
                        })
                        .then(() => {
                            console.log(
                                'Old profile picture deleted successfully'
                            );
                        })
                        .catch((deleteError) => {
                            console.error(
                                'Error deleting old profile picture:',
                                deleteError
                            );
                        });
                }
            } catch (error) {
                console.error('Error uploading profile picture:', error);
            }
        }
    };

    const handleUpdate = async (updateData: Partial<User>) => {
        try {
            const resultAction = await dispatch(updateUserData(updateData));
            if (updateUserData.fulfilled.match(resultAction)) {
                await update({
                    ...session,
                    user: { ...session?.user, ...updateData },
                });
            }
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }
        setIsEditing(false);

        const updateData: Partial<User> = { name };
        if (password) {
            updateData.password = password;
        }
        await handleUpdate(updateData);
    };

    if (isLoading) {
        return <ComponentSpinner />;
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-4xl mx-auto">
            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative flex flex-col items-center">
                        <div className="w-48 h-48 sm:w-64 sm:h-64 relative">
                            <Image
                                src={profilePicture}
                                alt="Profile Picture"
                                layout="fill"
                                objectFit="cover"
                                className="rounded-full"
                                style={{
                                    backgroundColor: `var(--${currentTheme}-background-300)`,
                                    border: `1px solid var(--${currentTheme}-card-border-color)`,
                                }}
                            />
                            {isUploadingPhoto && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                    <span className="loading loading-ring text-slate-200 h-12 w-12"></span>
                                </div>
                            )}
                        </div>
                        <button
                            className="absolute top-1 left-1 btn p-2 rounded-full w-12 h-12"
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
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="New Password"
                                    className="w-full p-2 rounded"
                                    autoComplete="new-password"
                                />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm New Password"
                                    className="w-full p-2 rounded"
                                    autoComplete="new-password"
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
                                    className="font-semibold text-lg"
                                    style={{
                                        color: `var(--${currentTheme}-text-default)`,
                                    }}
                                >
                                    {name}
                                </h3>
                                <h3
                                    className="font-semibold text-sm flex items-center gap-2"
                                    style={{
                                        color: `var(--${currentTheme}-text-default)`,
                                    }}
                                >
                                    <FaEnvelope className="w-4 h-4" />{' '}
                                    {user?.email}
                                </h3>
                                {user.createdAt && (
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
                                            new Date(user.createdAt)
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
                                    className="btn btn-sm btn-ghost p-2 hover:border-white/25 flex items-center justify-center gap-2 text-xs w-full"
                                    style={{
                                        color: `var(--${currentTheme}-text-default)`,
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
            <div className="quote-of-the-day p-4 text-center max-w-md text-xs mb-4 w-full">
                <div className="text-sm mb-2">Quote of the day:</div>
                <blockquote
                    className="text-md italic hover:scale-105 transition-all duration-300"
                    style={{ color: `var(--${currentTheme}-text-subtle)` }}
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
                                {user?.spacesCount || 0}/9
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <FaList className="w-6 h-6" />
                        <div>
                            <strong>Total Tasks:</strong>
                            <span className="ml-2">
                                {user?.totalTasksCreated || 0}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <FaCheckCircle className="w-6 h-6" />
                        <div>
                            <strong>Completed:</strong>
                            <span className="ml-2">
                                {user?.tasksCompleted || 0}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <FaSpinner className="w-6 h-6" />
                        <div>
                            <strong>In Progress:</strong>
                            <span className="ml-2">
                                {user?.tasksInProgress || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
