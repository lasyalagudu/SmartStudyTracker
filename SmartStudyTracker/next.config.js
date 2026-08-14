/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint errors are real problems — don't hide them at build time
  // eslint: { ignoreDuringBuilds: true },  // removed

  // Let Next.js optimize images (WebP conversion, lazy loading, resizing)
  // images: { unoptimized: true },         // removed — was disabling all optimization
};

module.exports = nextConfig;
