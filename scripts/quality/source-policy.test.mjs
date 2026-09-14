/**
 * @module scripts/quality/source-policy.test
 * @description Repository contract tests for module JSDoc, API tracers, and sensitive patterns.
 */

import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

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
  "dist-ssr",
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
  it("colocates backend modules and tests behind export-only parent indexes", async () => {
    /** Validate discovered leaves while allowing new module groups.
     * @param {string} directory Group path.
     * @returns {Promise<void>} Validation completion.
     */
    async function inspectGroup(directory) {
      const entries = await readdir(directory, { withFileTypes: true });
      assert.deepEqual(
        entries.filter((entry) => entry.isFile()).map((entry) => entry.name),
        ["index.js"],
        directory,
      );
      const barrel = await readFile(path.join(directory, "index.js"), "utf8");
      const exported = require(path.join(directory, "index.js"));
      for (const entry of entries.filter((entry) => entry.isDirectory())) {
        const target = path.join(directory, entry.name);
        const files = await readdir(target);
        if (files.includes("index.js")) {
          await inspectGroup(target);
          continue;
        }
        assert.ok(files.includes(`${entry.name}.js`), target);
        assert.ok(files.includes(`${entry.name}.test.js`), target);
        assert.ok(
          barrel.includes(`./${entry.name}/${entry.name}.js`),
          `Missing export: ${target}`,
        );
        const leaf = require(path.join(target, `${entry.name}.js`));
        const values = Object.values(exported);
        assert.ok(
          values.includes(leaf) ||
            Object.values(leaf).every((value) => values.includes(value)),
          `Unreachable public module: ${target}`,
        );
        const source = await readFile(
          path.join(target, `${entry.name}.js`),
          "utf8",
        );
        assert.ok(
          !/require\(["']\.\.\/index\.js["']\)/u.test(source),
          `Sibling barrel cycle: ${target}`,
        );
      }
    }
    await inspectGroup(path.join(REPOSITORY_ROOT, "app"));
  });

  it("gives every maintained JavaScript-family file parseable module JSDoc", async () => {
    const files = await collectSourceFiles(REPOSITORY_ROOT);
    const missingDocs = [];

    for (const filePath of files) {
      const source = await readFile(filePath, "utf8");
      if (!/^\/\*\*[\s\S]{0,600}?@module\s+/u.test(source)) {
        missingDocs.push(relativePath(filePath));
      }
      await require("jsdoc-to-markdown").getTemplateData({ source });
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
      "users",
      "users.js",
    );
    const source = await readFile(controllerPath, "utf8");
    assert.match(source, /\/\/ console\.log\([^\n]*API handler called/u);
    assert.match(source, /\/\/ console\.log\([^\n]*API handler return/u);
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
