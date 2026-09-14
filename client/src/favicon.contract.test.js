/**
 * @module favicon.contract.test
 * @description Contract coverage for the complete browser and installable-app favicon set.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const CLIENT_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIRECTORY = join(CLIENT_DIRECTORY, "public");

const REQUIRED_ICON_FILES = [
  "favicon.ico",
  "images/favicon-16x16.png",
  "images/favicon-32x32.png",
  "images/favicon-48x48.png",
  "images/app-icon-64.png",
  "images/apple-touch-icon.png",
  "images/android-chrome-192x192.png",
  "images/android-chrome-512x512.png",
  "images/mstile-150x150.png",
];

describe("favicon assets", () => {
  it("publishes every declared browser and installable-app icon", () => {
    for (const relativePath of REQUIRED_ICON_FILES) {
      const iconPath = join(PUBLIC_DIRECTORY, relativePath);
      expect(existsSync(iconPath), relativePath).toBe(true);
      expect(statSync(iconPath).size, relativePath).toBeGreaterThan(0);
    }

    const documentSource = readFileSync(
      join(CLIENT_DIRECTORY, "index.html"),
      "utf8",
    );
    expect(documentSource).toContain('href="/favicon.ico"');
    expect(documentSource).toContain('href="/site.webmanifest"');
    expect(documentSource).toContain('href="/images/apple-touch-icon.png"');

    const manifest = JSON.parse(
      readFileSync(join(PUBLIC_DIRECTORY, "site.webmanifest"), "utf8"),
    );
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: "192x192" }),
        expect.objectContaining({ sizes: "512x512" }),
      ]),
    );
  });
});
