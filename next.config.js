/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    experimental: {
        staleTimes: {
            dynamic: 30,
        },
    },
};

module.exports = nextConfig;
