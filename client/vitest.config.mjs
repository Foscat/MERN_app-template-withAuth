/**
 * @module client/vitest.config
 * @description Vitest configuration for React components and browser-oriented utilities.
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    css: true,
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    setupFiles: "./src/test/setup.js",
  },
});
