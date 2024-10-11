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
    experimental: {
        outputStandalone: true,
    },
};

module.exports = {
    ...nextConfig,
    server: {
        port: 3001,
        host: '0.0.0.0',
    },
};

export default nextConfig;
