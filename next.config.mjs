/** @type {import('next').NextConfig} */
const nextConfig = {
    // profiler: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'files.edgestore.dev',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    output: 'standalone',
    server: {
        port: 3001,
    },
};

export default nextConfig;
