import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';
import { signOut, useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { setUser, updateUserData } from '@/store/userSlice';
import { User } from '@/types';
import { useEdgeStore } from '@/lib/edgestore';
import Preloader from '../SuperSpace/Preloader';
import { FaEnvelope, FaPencil } from 'react-icons/fa6';
import { ComponentSpinner } from '../ComponentSpinner';
import { FaSignOutAlt } from 'react-icons/fa';

const ProfileSettings = () => {
    const theme = useTheme();
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
        <div className="flex flex-col items-center justify-center p-6 h-full w-full rounded-lg">
            <div className="flex flex-col sm:items-center md:items-start md:w-6/12 justify-center">
                <div className="relative grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative">
                        <div className="w-[200px] h-[200px]">
                            <Image
                                src={profilePicture}
                                alt="Profile Picture"
                                width={200}
                                height={200}
                                className="rounded-full object-cover"
                                style={{
                                    backgroundColor: `var(--${theme}-emphasis-light)`,
                                }}
                            />
                            {isUploadingPhoto && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full w-[200px] h-[200px]">
                                    <span className="loading loading-ring text-slate-200 loading-lg h-12 w-12"></span>
                                </div>
                            )}
                        </div>
                        <button
                            className="absolute top-1 left-0 btn text-white p-2 rounded-full w-12 h-12"
                            style={{
                                border: `3px solid var(--${theme}-background-100)`,
                                backgroundColor: `var(--${theme}-background-200)`,
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
                    {isEditing ? (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col items-start justify-start gap-2 mt-4"
                        >
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
                                onChange={(e) => setPassword(e.target.value)}
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
                                className="btn btn-sm p-2 rounded flex flex-row items-center justify-center gap-2 text-xs"
                                style={{
                                    backgroundColor: `var(--${theme}-background-200)`,
                                    color: `var(--${theme}-text-subtle)`,
                                }}
                            >
                                Update Profile
                            </button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-start justify-start gap-2 mt-4 space-y-2">
                            <h3 className="font-semibold text-lg">{name}</h3>
                            <h3 className="font-semibold text-sm flex flex-row items-center justify-center gap-2">
                                <FaEnvelope className="w-4 h-4" /> {user?.email}
                            </h3>
                            <button
                                className="btn btn-sm p-2 rounded flex flex-row items-center justify-center gap-2 text-xs"
                                style={{
                                    backgroundColor: `var(--${theme}-background-200)`,
                                    color: `var(--${theme}-text-subtle)`,
                                }}
                                onClick={() => setIsEditing(true)}
                            >
                                <FaPencil className="w-4 h-4 text-sm" />
                                Name / Password
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <hr
                className="w-full h-px my-8 border-0 rounded"
                style={{ backgroundColor: `var(--${theme}-background-200)` }}
            />
            <div className="w-6/12 min-w-64 flex flex-col items-start justify-center">
                <h3 className="text-xl font-bold mb-4 bg-transparent">
                    Stats:
                </h3>
                <div className="flex flex-row items-center justify-between gap-2 w-full">
                    <p>Spaces: {/* Add number of spaces */}</p>
                </div>
                <div className="flex flex-row items-center justify-between gap-2 w-full">
                    <p>Tasks Completed: {/* Add completed tasks count */}</p>
                    <p>
                        Tasks In Progress: {/* Add in-progress tasks count */}
                    </p>
                    <p>Tasks To Do: {/* Add to-do tasks count */}</p>
                </div>
            </div>
            <button
                className="btn btn-sm bg-white/10 hover:bg-transparent hover:border-white/25 px-2 py-1 text-sm mt-2"
                style={{
                    color: `var(--${theme}-emphasis-light)`,
                }}
                onClick={() => signOut()}
            >
                <FaSignOutAlt /> Log out
            </button>
        </div>
    );
};

export default ProfileSettings;
