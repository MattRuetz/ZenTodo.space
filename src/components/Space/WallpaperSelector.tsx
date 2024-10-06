import { useState } from 'react';
import { SpaceData } from '../../types';
import { getContrastingColor } from '../../app/utils/utils';
import useSetWallpaper from '../../hooks/useSetWallpaper';
import { useTheme } from '../../hooks/useTheme';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { useEdgeStore } from '@/lib/edgestore';
import { useDispatch } from 'react-redux';
import { updateUserData } from '@/store/userSlice';
import { AppDispatch } from '@/store/store';
import { setWallpaper, updateSpace } from '@/store/spaceSlice';

const WallpaperSelector = ({ space }: { space: SpaceData }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { edgestore } = useEdgeStore();

    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [selectedWallpaper, setSelectedWallpaper] = useState(
        space.wallpaper || '/images/placeholder_image.webp'
    );

    const handleWallpaperChange = async (
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
                    headers: {
                        Context: 'wallpaper',
                    },
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
                setSelectedWallpaper(res.url);
                setIsUploadingPhoto(false);
                dispatch(setWallpaper(res.url));

                // Update space data in the database
                const updateData: Partial<SpaceData> = {
                    wallpaper: res.url,
                    _id: space._id,
                };
                await dispatch(updateSpace(updateData));

                // Delete the old wallpaper picture asynchronously
                if (
                    space.wallpaper &&
                    space.wallpaper !== '/images/placeholder_image.webp'
                ) {
                    edgestore.publicFiles
                        .delete({
                            url: space.wallpaper,
                        })
                        .then(() => {
                            console.log('Old wallpaper deleted successfully');
                        })
                        .catch((deleteError) => {
                            console.error(
                                'Error deleting old wallpaper:',
                                deleteError
                            );
                        });
                }
            } catch (error) {
                console.error('Error uploading wallpaper:', error);
            }
        }
    };

    return (
        <div className="h-[80px] overflow-hidden relative rounded-lg border-2 border-transparent hover:border-white transition-all duration-300">
            <div className="h-full overflow-hidden">
                <img
                    src={selectedWallpaper}
                    alt="Current Wallpaper"
                    className="w-full h-full object-cover cursor-pointer"
                />
                <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleWallpaperChange}
                />
            </div>

            {/* Pencil icon overlay on hover */}
            <div
                className="absolute w-full h-full top-0 left-0 flex items-center justify-center opacity-0 hover:opacity-100 hover:cursor-pointer hover:bg-black/50 trasition-all duration-300"
                onClick={() => document.getElementById('fileInput')?.click()}
            >
                <FaPencilAlt className="text-white text-2xl" />
            </div>
            {isUploadingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <span className="loading loading-ring text-slate-200 h-12 w-12"></span>
                </div>
            )}
            <button
                data-tooltip-id="remove-wallpaper-tooltip"
                className="btn btn-xs text-white rounded transition absolute bottom-1 right-1 hover:text-red-500"
                onClick={() => {
                    setSelectedWallpaper('/images/placeholder_image.webp');
                    dispatch(updateSpace({ ...space, wallpaper: '' }));
                    // Here you would also dispatch an action to update the wallpaper in the store
                }}
            >
                <FaTrash />
            </button>
            <Tooltip
                id="remove-wallpaper-tooltip"
                place="top"
                style={{
                    backgroundColor: 'white',
                    color: 'black',
                    fontSize: '12px',
                }}
            >
                Remove Wallpaper
            </Tooltip>
        </div>
    );
};

export default WallpaperSelector;
