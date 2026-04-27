"use client";

import { useEffect } from "react";

export function LocatorRuntime() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    void import("@locator/runtime").then(({ setup }) => {
      setup({
        adapter: "jsx",
        showIntro: false,
      });
    });
  }, []);

  return null;
}
