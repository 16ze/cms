import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 🔒 Headers de sécurité HTTP
  async headers() {
    const securityHeaders = [
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-XSS-Protection",
        value: "1; mode=block",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "Content-Security-Policy",
        value:
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;",
      },
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // ⚡ Optimisations pour réduire les rebuilds Fast Refresh
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimiser les watchers pour éviter les rebuilds inutiles
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          "**/node_modules",
          "**/.git",
          "**/.next",
          "**/prisma/prisma",
          "**/tests",
          "**/tests-logs",
          "**/*.test.ts",
          "**/*.spec.ts",
          // ⚡ Ignorer les fichiers JSON de config pour éviter les rebuilds constants
          "**/src/config/*.json",
          "**/backups/**",
          "**/exports/**",
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

// Configuration Sentry (si DSN est défini)
const sentryOptions = {
  // Silently print source maps
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Only upload source maps in production
  widenClientFileUpload: true,
  // Transpiles SDK to be compatible with IE11
  transpileClientSDK: true,
  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
};

// Wrapper avec Sentry si configuré
const isSentryEnabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === "production");

export default isSentryEnabled
  ? withSentryConfig(nextConfig, sentryOptions)
  : nextConfig;
