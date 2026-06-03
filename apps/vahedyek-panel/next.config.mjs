import path from 'node:path';
import { fileURLToPath } from 'node:url';

const withLocator = process.env.LOCATOR_JS === '1';
const allowedDevOrigins = (
  process.env.NEXT_ALLOWED_DEV_ORIGINS ?? 'localhost,127.0.0.1,192.168.7.169'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const projectDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(projectDir, '../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins,
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
  ...(withLocator
    ? {
        turbopack: {
          root: workspaceRoot,
          rules: {
            '**/*.{tsx,jsx}': {
              condition: 'development',
              loaders: [
                {
                  loader: '@locator/webpack-loader',
                  options: {
                    env: 'development',
                  },
                },
              ],
            },
          },
        },
      }
    : {}),
};

export default nextConfig;
