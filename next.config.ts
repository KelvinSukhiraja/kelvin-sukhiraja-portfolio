import type { NextConfig } from 'next';
const config: NextConfig = {
 images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' }] },
 poweredByHeader: false,
};
export default config;
