"use client";

import { useEffect } from "react";

type LocatorRuntimeModule = {
  setup: (options: { adapter: string; showIntro: boolean }) => void;
};

export function LocatorRuntime() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const loadLocatorRuntime = new Function(
      'return import("@locator/runtime")',
    ) as () => Promise<LocatorRuntimeModule>;

    void loadLocatorRuntime().then(({ setup }) => {
      setup({
        adapter: "jsx",
        showIntro: false,
      });
    });
  }, []);

  return null;
}
