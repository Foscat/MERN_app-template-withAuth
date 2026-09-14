/**
 * Tests for the granular documentation generation plan.
 *
 * @module scripts/docs/generate-docs.test
 */

import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const generatorPath = path.resolve("scripts/docs/generate-docs.mjs");

test("creates a stable module-per-file documentation plan without test sources", async () => {
  assert.equal(
    existsSync(generatorPath),
    true,
    "Expected scripts/docs/generate-docs.mjs to implement the documentation generator.",
  );

  const { createDocumentationPlan } = await import(
    pathToFileURL(generatorPath)
  );
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "mern-docs-plan-"));

  try {
    const sources = [
      "server.js",
      "app/controllers/users.js",
      "client/src/App.js",
      "client/src/App.jsx",
      "client/src/App.test.jsx",
    ];

    for (const source of sources) {
      const absoluteSource = path.join(fixtureRoot, source);
      await mkdir(path.dirname(absoluteSource), { recursive: true });
      await writeFile(absoluteSource, `/** @module ${source} */\n`, "utf8");
    }

    const plan = await createDocumentationPlan({
      rootDir: fixtureRoot,
      renderSource: async (sourcePath) =>
        `Rendered ${path.basename(sourcePath)}`,
    });
    const outputs = [...plan.keys()].sort();

    assert.deepEqual(
      outputs.filter((output) => output.includes("docs/generated/backend/")),
      [
        "docs/generated/backend/README.md",
        "docs/generated/backend/app/controllers/users.js.md",
        "docs/generated/backend/server.js.md",
      ],
    );
    assert.deepEqual(
      outputs.filter((output) => output.includes("docs/generated/client/")),
      [
        "docs/generated/client/App.js.md",
        "docs/generated/client/App.jsx.md",
        "docs/generated/client/README.md",
      ],
    );
    assert.equal(
      outputs.some((output) => output.includes("App.test")),
      false,
    );
    assert.equal(plan.has("docs/api-reference.md"), true);
    assert.equal(plan.has("docs/client-components.md"), true);
    assert.equal(plan.has("docs/generated/README.md"), true);
    assert.equal(plan.has("docs/generated/manifest.json"), true);

    const manifest = JSON.parse(plan.get("docs/generated/manifest.json"));
    assert.equal(manifest.schemaVersion, 1);
    assert.deepEqual(
      manifest.modules.map(({ source }) => source),
      [
        "app/controllers/users.js",
        "client/src/App.js",
        "client/src/App.jsx",
        "server.js",
      ],
    );
  } finally {
    await rm(fixtureRoot, { force: true, recursive: true });
  }
});

test("records deterministic source and documentation fingerprints", async () => {
  const { createDocumentationPlan } = await import(
    pathToFileURL(generatorPath)
  );
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "mern-docs-hash-"));
  const serverPath = path.join(fixtureRoot, "server.js");

  try {
    await writeFile(
      serverPath,
      "/** @module server */\nconst value = 1;\n",
      "utf8",
    );

    const firstPlan = await createDocumentationPlan({
      rootDir: fixtureRoot,
      renderSource: async () => "Rendered server documentation",
    });
    const firstManifest = JSON.parse(
      firstPlan.get("docs/generated/manifest.json"),
    );
    const firstModule = firstManifest.modules[0];

    assert.match(firstModule.sourceSha256, /^[a-f0-9]{64}$/);
    assert.match(firstModule.documentationSha256, /^[a-f0-9]{64}$/);

    await writeFile(
      serverPath,
      "/** @module server */\nconst value = 2;\n",
      "utf8",
    );
    const secondPlan = await createDocumentationPlan({
      rootDir: fixtureRoot,
      renderSource: async () => "Rendered server documentation",
    });
    const secondManifest = JSON.parse(
      secondPlan.get("docs/generated/manifest.json"),
    );

    assert.notEqual(
      secondManifest.modules[0].sourceSha256,
      firstModule.sourceSha256,
    );
    assert.equal(
      secondManifest.modules[0].documentationSha256,
      firstModule.documentationSha256,
    );
  } finally {
    await rm(fixtureRoot, { force: true, recursive: true });
  }
});

test("does not rewrite generated files whose content is unchanged", async () => {
  const { writeDocumentationPlan } = await import(pathToFileURL(generatorPath));
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "mern-docs-write-"));
  const plan = new Map([
    ["docs/generated/README.md", "# Generated documentation\n"],
  ]);

  try {
    assert.deepEqual(await writeDocumentationPlan(fixtureRoot, plan), {
      updated: 1,
      unchanged: 0,
      removed: 0,
    });
    assert.deepEqual(await writeDocumentationPlan(fixtureRoot, plan), {
      updated: 0,
      unchanged: 1,
      removed: 0,
    });
  } finally {
    await rm(fixtureRoot, { force: true, recursive: true });
  }
});

test("removes trailing whitespace from generated Markdown", async () => {
  const { createDocumentationPlan } = await import(
    pathToFileURL(generatorPath)
  );
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "mern-docs-clean-"));

  try {
    await writeFile(
      path.join(fixtureRoot, "server.js"),
      "/** @module server */\n",
      "utf8",
    );
    const plan = await createDocumentationPlan({
      rootDir: fixtureRoot,
      renderSource: async () => "Rendered line  \nNext line\t\n",
    });

    assert.doesNotMatch(
      plan.get("docs/generated/backend/server.js.md"),
      /[\t ]+$/m,
    );
  } finally {
    await rm(fixtureRoot, { force: true, recursive: true });
  }
});
