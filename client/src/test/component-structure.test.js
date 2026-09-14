/**
 * @module test.component-structure
 * @description Enforces colocated component sources, tests, and named public exports.
 */
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const COMPONENT_GROUPS = Object.fromEntries(
  ["parts", "pages"].map((group) => [
    group,
    readdirSync(
      join(dirname(fileURLToPath(import.meta.url)), "../components", group),
      { withFileTypes: true },
    )
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name),
  ]),
);
const BARREL_LOADERS = import.meta.glob("../components/*/index.js");

describe("component organization", () => {
  it("keeps each component with its test and exports it through its parent", async () => {
    for (const [group, names] of Object.entries(COMPONENT_GROUPS)) {
      const directory = join(
        dirname(fileURLToPath(import.meta.url)),
        "..",
        "components",
        group,
      );
      const missing = names
        .flatMap((name) => [`${name}/${name}.jsx`, `${name}/${name}.test.jsx`])
        .filter((file) => !existsSync(join(directory, file)));
      expect(missing, `${group}: missing colocated files`).toEqual([]);

      const entries = readdirSync(directory, { withFileTypes: true });
      expect(
        entries.filter((entry) => entry.isFile()).map((entry) => entry.name),
      ).toEqual(["index.js"]);
      expect(
        entries
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
          .sort(),
      ).toEqual([...names].sort());

      const exports = await BARREL_LOADERS[`../components/${group}/index.js`]();
      expect(Object.keys(exports).sort()).toEqual([...names].sort());
      for (const name of names)
        expect(exports[name], name).toBeTypeOf("function");
    }
  });
});
