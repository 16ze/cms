import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ⚡ Optimisations pour réduire les rebuilds Fast Refresh
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimiser les watchers pour éviter les rebuilds inutiles
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules',
          '**/.git',
          '**/.next',
          '**/prisma/prisma',
          '**/tests',
          '**/tests-logs',
          '**/*.test.ts',
          '**/*.spec.ts',
          // ⚡ Ignorer les fichiers JSON de config pour éviter les rebuilds constants
          '**/src/config/*.json',
          '**/backups/**',
          '**/exports/**',
        ],
      };
    }
    return config;
  },
  
  // Compiler plus rapide en dev
  swcMinify: true,
  
  // Désactiver le source map en dev pour gagner en vitesse
  productionBrowserSourceMaps: false,
};

export default nextConfig;
