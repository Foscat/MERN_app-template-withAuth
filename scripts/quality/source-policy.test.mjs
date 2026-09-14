/**
 * @module scripts/quality/source-policy.test
 * @description Repository contract tests for module JSDoc, API tracers, and sensitive patterns.
 */

import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const SOURCE_EXTENSIONS = new Set([".cjs", ".js", ".jsx", ".mjs", ".ts"]);
const IGNORED_DIRECTORIES = new Set([
  ".git",
  "coverage",
  "dist",
  "docs",
  "node_modules",
  "playwright-report",
  "test-results",
]);

/**
 * Collect maintained JavaScript-family files recursively.
 *
 * @param {string} directory - Directory to inspect.
 * @returns {Promise<string[]>} Absolute source paths.
 */
async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return IGNORED_DIRECTORIES.has(entry.name)
          ? []
          : collectSourceFiles(entryPath);
      }
      return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [entryPath] : [];
    }),
  );
  return nestedFiles.flat();
}

/**
 * Convert an absolute path to a platform-neutral repository path.
 *
 * @param {string} filePath - Absolute file path.
 * @returns {string} Repository-relative path.
 */
function relativePath(filePath) {
  return path.relative(REPOSITORY_ROOT, filePath).replaceAll("\\", "/");
}

describe("source quality policy", () => {
  it("gives every maintained JavaScript-family file parseable module JSDoc", async () => {
    const files = await collectSourceFiles(REPOSITORY_ROOT);
    const missingDocs = [];

    for (const filePath of files) {
      const source = await readFile(filePath, "utf8");
      if (!/^\/\*\*[\s\S]{0,600}?@module\s+/u.test(source)) {
        missingDocs.push(relativePath(filePath));
      }
    }

    assert.deepEqual(missingDocs, []);
  });

  it("keeps frontend API request and response tracers available but disabled", async () => {
    const files = await collectSourceFiles(
      path.join(REPOSITORY_ROOT, "client", "src"),
    );
    const missingTracers = [];

    for (const filePath of files) {
      const source = await readFile(filePath, "utf8");
      const lines = source.split(/\r?\n/u);
      lines.forEach((line, index) => {
        if (!/\b(?:api|axios)\.(?:delete|get|patch|post|put)\(/u.test(line)) {
          return;
        }

        const context = lines
          .slice(Math.max(0, index - 3), Math.min(lines.length, index + 5))
          .join("\n");
        if (
          !/\/\/ console\.log\([^\n]*API call/u.test(context) ||
          !/\/\/ console\.log\([^\n]*API return/u.test(context)
        ) {
          missingTracers.push(`${relativePath(filePath)}:${index + 1}`);
        }
      });
    }

    assert.deepEqual(missingTracers, []);
  });

  it("keeps every user API handler entry and return tracer disabled", async () => {
    const controllerPath = path.join(
      REPOSITORY_ROOT,
      "app",
      "controllers",
      "users.js",
    );
    const source = await readFile(controllerPath, "utf8");
    const handlers = [
      "create",
      "currentUser",
      "findAll",
      "findById",
      "login",
      "logout",
      "refreshToken",
      "register",
      "remove",
      "update",
    ];

    for (const handler of handlers) {
      assert.match(
        source,
        new RegExp(`// console\\.log\\(\\"${handler}[^\\n]*called`),
      );
      assert.match(
        source,
        new RegExp(`// console\\.log\\(\\"${handler}[^\\n]*return`),
      );
    }
  });

  it("prevents persistent access tokens, raw query forwarding, and active debug logs", async () => {
    const files = await collectSourceFiles(REPOSITORY_ROOT);
    const violations = [];

    for (const filePath of files) {
      const source = await readFile(filePath, "utf8");
      const maintainedSource = relativePath(filePath);
      if (/localStorage\.(?:getItem|setItem)\(["']token["']/u.test(source)) {
        violations.push(`${maintainedSource}: persistent access token`);
      }
      if (/\.find\(req\.query\)/u.test(source)) {
        violations.push(`${maintainedSource}: raw request query`);
      }
      if (
        /^(?!\s*\/\/)\s*console\.(?:debug|error|info|log|warn)\(/mu.test(source)
      ) {
        violations.push(`${maintainedSource}: active debug log`);
      }
    }

    assert.deepEqual(violations, []);
  });
});
