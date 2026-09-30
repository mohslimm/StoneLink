/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Turbopack (remplace Webpack, 5-10x plus rapide en dev) ───
  turbopack: {
    root: __dirname,
  },

  // ─── Cache de build : dossier local pour éviter le slow filesystem ───
  distDir: '.next',

  // ─── Compression Gzip/Brotli ───
  compress: true,

  // ─── Optimisations production ───
  reactStrictMode: true,

  // ─── Headers de cache statiques ───
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // ─── Optimisation des imports ───
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;
