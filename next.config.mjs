/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['zentodo.space'], // Add your domain here
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
    // output: 'standalone',
    // server: {
    //     port: 3001,
    //     host: '0.0.0.0',
    // },
};

export default nextConfig;
