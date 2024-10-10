import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';

const BuyMeACoffee: React.FC = () => {
    const theme = useTheme();
    return (
        <div className="flex flex-row items-center justify-center gap-4 text-white py-1">
            <div className="items-center justify-center gap-2 hidden sm:flex">
                <Image
                    src="/images/Logo Icon Final-cropped.svg"
                    alt="Buy me a coffee"
                    width={20}
                    height={20}
                />
                <p className="text-sm">Matt Ruetz</p>
            </div>
            <a
                className="buyButton flex items-center justify-center gap-2 p-1 rounded-lg hover:scale-105 transition-all duration-200 border border-black"
                style={{
                    backgroundColor: '#FFDD00',
                }}
                target="_blank"
                href="https://buymeacoffee.com/mattruetz"
            >
                <img
                    className="coffeeImage"
                    src="https://downloads.intercomcdn.com/i/o/234105/0d29fbdf17e257cdfc2ba1ba/7103925065c5e9bd6ac7ac9efd453fd7.png"
                    alt="Buy me a coffee"
                    width={100}
                    height={100}
                />
            </a>
        </div>
    );
};

export default BuyMeACoffee;
