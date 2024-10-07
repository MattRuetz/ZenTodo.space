import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';
import { SpaceData } from '@/types';
import { updateSpace } from '@/store/spaceSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { FaPalette } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import debounce from 'lodash.debounce';

export default function SpaceBackgroundColorPicker({
    space,
}: {
    space: SpaceData;
}) {
    const theme = useTheme();
    const [selectedColor, setSelectedColor] = useState(
        `var(--${theme}-space-background)`
    );
    const dispatch = useDispatch<AppDispatch>();

    // Update selectedColor if space.backgroundColor changes
    useEffect(() => {
        setSelectedColor(space.backgroundColor);
    }, [space.backgroundColor]);

    const handleColorChange = debounce((color: string) => {
        // Use custom useThrottle
        setSelectedColor(color);
        console.log('color', color);
        dispatch(updateSpace({ ...space, backgroundColor: color }))
            .unwrap()
            .catch((error) => {
                console.error('Failed to update background color:', error);
                // Optionally show an alert or notification to the user
            });
    }, 300); // Adjust the delay as needed

    return (
        <div
            className="relative flex items-center gap-2 w-full h-[50px] border-2 border-transparent hover:border-white transition-all duration-300 rounded-lg"
            style={{
                backgroundColor: `var(--${theme}-background-100)`,
                color: `var(--${theme}-text-default)`,
            }}
        >
            <div className="w-full h-full flex items-center justify-center">
                <label
                    htmlFor="colorPicker"
                    className="p-2 cursor-pointer text-sm font-medium w-full text-center flex items-center justify-center h-full"
                >
                    <div
                        className="w-6 h-6 rounded-full mr-2"
                        style={{
                            backgroundColor: selectedColor,
                        }}
                    ></div>
                    <span className="hidden md:inline">Background Color</span>
                </label>
                <input
                    id="colorPicker"
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-full h-full cursor-pointer"
                    style={{
                        backgroundColor: selectedColor,
                        visibility: 'hidden',
                        width: '0',
                    }}
                />
            </div>

            <div
                className="w-full h-full absolute top-0 left-0 rounded-lg text-white bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('colorPicker')?.click();
                }}
            >
                <FaPencil className="w-6 h-6" />
            </div>
        </div>
    );
}