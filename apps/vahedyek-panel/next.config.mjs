const withLocator = process.env.LOCATOR_JS === '1';
const allowedDevOrigins = (
  process.env.NEXT_ALLOWED_DEV_ORIGINS ?? 'localhost,127.0.0.1,192.168.7.169'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins,
  ...(withLocator
    ? {
        turbopack: {
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
