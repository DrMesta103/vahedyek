import type { NextConfig } from "next";

const withLocator = process.env.LOCATOR_JS === "1";

const nextConfig: NextConfig = {
  ...(withLocator
    ? {
        turbopack: {
          rules: {
            "**/*.{tsx,jsx}": {
              condition: "development",
              loaders: [
                {
                  loader: "@locator/webpack-loader",
                  options: {
                    env: "development",
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
