/** @module scripts/dev/scaffold.test
 * @description Scaffolding must preserve existing files and reject unsafe targets.
 */
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { it } from "node:test";
import jsdoc from "jsdoc-to-markdown";
import { check } from "prettier";

it("formats generated implementation, test, and barrel to the baseline", async () => {
  const { scaffold } = await import("./scaffold.mjs");
  const root = await mkdtemp(
    path.join(os.tmpdir(), "template-scaffold-format-"),
  );
  try {
    const group = path.join(root, "client/src/components/parts");
    await mkdir(group, { recursive: true });
    await writeFile(path.join(group, "index.js"), "/** @module parts */\n");
    await scaffold("component", "ExampleCard", root);
    for (const relative of [
      "ExampleCard/ExampleCard.jsx",
      "ExampleCard/ExampleCard.test.jsx",
      "index.js",
    ]) {
      const filepath = path.join(group, relative);
      assert.equal(
        await check(await readFile(filepath, "utf8"), { filepath }),
        true,
        relative,
      );
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it("emits parseable parameter and return documentation for API modules", async () => {
  const { scaffold } = await import("./scaffold.mjs");
  const root = await mkdtemp(path.join(os.tmpdir(), "template-scaffold-docs-"));
  try {
    const group = path.join(root, "client/src/api");
    await mkdir(group, { recursive: true });
    await writeFile(path.join(group, "index.js"), "/** @module api */\n");
    await scaffold("api", "example", root);
    const source = await readFile(
      path.join(group, "example/example.js"),
      "utf8",
    );
    const definitions = await jsdoc.getTemplateData({ source });
    const operation = definitions.find(
      (entry) => entry.name === "example" && entry.kind === "function",
    );
    assert.equal(operation.params[0].name, "options");
    assert.deepEqual(operation.returns[0].type.names, ["Object"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
it("creates colocated modules and refuses collisions or path traversal", async () => {
  const { scaffold } = await import("./scaffold.mjs");
  const root = await mkdtemp(path.join(os.tmpdir(), "template-scaffold-test-"));
  try {
    const group = path.join(root, "client/src/components/parts");
    await mkdir(group, { recursive: true });
    await writeFile(path.join(group, "index.js"), "/** @module parts */\n");
    await scaffold("component", "ExampleCard", root);
    assert.match(
      await readFile(path.join(group, "ExampleCard/ExampleCard.jsx"), "utf8"),
      /@module/,
    );
    assert.match(
      await readFile(
        path.join(group, "ExampleCard/ExampleCard.test.jsx"),
        "utf8",
      ),
      /getByRole/,
    );
    assert.match(
      await readFile(path.join(group, "index.js"), "utf8"),
      /export \{ ExampleCard \}/,
    );
    await assert.rejects(scaffold("component", "ExampleCard", root), /exists/);
    await assert.rejects(scaffold("api", "../escape", root), /name/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
