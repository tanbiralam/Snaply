/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/editor",
        destination: "/create/screenshot",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
