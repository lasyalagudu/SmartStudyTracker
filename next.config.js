/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow external profile photo URLs from common sources.
    // Add more domains here if mentors use other image hosts.
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "media.licdn.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
      { protocol: "https", hostname: "**.clerk.com" },
    ],
  },
};

module.exports = nextConfig;
