import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
     },
     reactStrictMode: false,
     swcMinify: true,
     output: "standalone",
     images: {
        formats: ['image/avif'],
        
     }
}
 
export default withNextIntl(nextConfig);