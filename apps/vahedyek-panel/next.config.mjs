const withLocator = process.env.LOCATOR_JS === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
