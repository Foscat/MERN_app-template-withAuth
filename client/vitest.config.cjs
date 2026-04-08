const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    css: true,
    setupFiles: "./src/test/setup.js",
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
  },
});
