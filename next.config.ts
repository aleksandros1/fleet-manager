/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Κρατάμε αυτή τη ρύθμιση για το Cloudflare
  },
};

module.exports = nextConfig;