"use client";

import { useEffect } from "react";

export function LocatorRuntime() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || process.env.LOCATOR_JS !== "1") {
      return;
    }

    const loadLocatorRuntime = new Function("specifier", "return import(specifier)") as (
      specifier: string,
    ) => Promise<{ setup: (options: { adapter: string; showIntro: boolean }) => void }>;

    void loadLocatorRuntime("@locator/runtime")
      .then(({ setup }) => {
        setup({
          adapter: "jsx",
          showIntro: false,
        });
      })
      .catch(() => {
        // Locator is optional in local development.
      });
  }, []);

  return null;
}
