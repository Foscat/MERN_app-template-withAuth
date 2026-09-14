/**
 * @module semantic-ui.contract.test
 * @description Contract coverage for the application's semantic CSS migration.
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const TEST_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const CLIENT_DIRECTORY = resolve(TEST_DIRECTORY, "..");
const REPOSITORY_DIRECTORY = resolve(CLIENT_DIRECTORY, "..");
const TEXT_EXTENSIONS = new Set([".css", ".js", ".jsx", ".json", ".md"]);
const IGNORED_DIRECTORIES = new Set(["dist", "node_modules", "test-results"]);

/**
 * Collect text files that form part of the maintained application surface.
 *
 * @param {string} directory - Directory to inspect recursively.
 * @returns {string[]} Absolute paths for maintained text files.
 */
function collectTextFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return IGNORED_DIRECTORIES.has(entry.name)
        ? []
        : collectTextFiles(entryPath);
    }

    return TEXT_EXTENSIONS.has(extname(entry.name)) ? [entryPath] : [];
  });
}

describe("semantic UI integration", () => {
  it("uses the pinned three-library stack without legacy component-suite references", () => {
    const clientPackage = JSON.parse(
      readFileSync(join(CLIENT_DIRECTORY, "package.json"), "utf8"),
    );
    const expectedDependencies = {
      "interactive-surface-css": "1.7.0",
      "layout-style-css": "3.2.0",
      "ui-style-kit-css": "2.4.0",
    };

    expect(clientPackage.dependencies).toMatchObject(expectedDependencies);

    const legacySuiteName = ["r", "suite"].join("");
    expect(clientPackage.dependencies).not.toHaveProperty(legacySuiteName);
    expect(clientPackage.dependencies).not.toHaveProperty(
      `@${legacySuiteName}/icons`,
    );

    const maintainedFiles = [
      ...collectTextFiles(join(CLIENT_DIRECTORY, "src")),
      join(CLIENT_DIRECTORY, "README.md"),
      join(REPOSITORY_DIRECTORY, "README.md"),
      join(REPOSITORY_DIRECTORY, "package.json"),
    ];
    const legacyReferences = maintainedFiles.filter((filePath) =>
      readFileSync(filePath, "utf8").toLowerCase().includes(legacySuiteName),
    );

    expect(legacyReferences).toEqual([]);

    const mainSource = readFileSync(
      join(CLIENT_DIRECTORY, "src", "main.jsx"),
      "utf8",
    );
    const semanticImports = [
      "await loadConfiguredStyle(siteConfig);",
      'await import("ui-style-kit-css/interactive-surface-theme.css");',
      'await import("interactive-surface-css/state-core.css");',
      'await import("layout-style-css");',
    ];
    const importPositions = semanticImports.map((statement) =>
      mainSource.indexOf(statement),
    );

    expect(importPositions.every((position) => position >= 0)).toBe(true);
    expect(importPositions).toEqual(
      [...importPositions].sort((left, right) => left - right),
    );

    const localStylesheets = collectTextFiles(
      join(CLIENT_DIRECTORY, "src"),
    ).filter((filePath) => extname(filePath) === ".css");

    expect(mainSource).not.toContain('import("./index.css")');
    expect(localStylesheets).toEqual([]);
  });
});
