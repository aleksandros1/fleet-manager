/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Προσθέστε αυτή τη γραμμή
  images: {
    unoptimized: true, // Απαραίτητο για Cloudflare/Static export
  },
};

module.exports = nextConfig;