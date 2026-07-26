import path from "node:path";
import type { NextConfig } from "next";

const withLocator = process.env.LOCATOR_JS === "1";
const workspaceRoot = path.resolve(__dirname, "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
    ...(withLocator
      ? {
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
        }
      : {}),
  },
};

export default nextConfig;
