/**
 * @module test.api-structure
 * @description Enforces colocated API modules and their shared named entry point.
 */
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const API_DIRECTORY = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "api",
);
const BARRELS = import.meta.glob("../api/index.js");

it("colocates API sources and tests behind named public exports", async () => {
  const modules = readdirSync(API_DIRECTORY, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  for (const name of modules) {
    for (const suffix of [".js", ".test.js"]) {
      expect(
        existsSync(join(API_DIRECTORY, name, `${name}${suffix}`)),
        `${name}${suffix}`,
      ).toBe(true);
    }
  }
  expect(readdirSync(API_DIRECTORY).sort()).toEqual(
    ["index.js", ...modules].sort(),
  );
  const api = await BARRELS["../api/index.js"]();
  const sources = import.meta.glob("../api/*/*.js");
  for (const name of modules) {
    const leaf = await sources[`../api/${name}/${name}.js`]();
    for (const [key, value] of Object.entries(leaf))
      expect(Object.values(api), key).toContain(value);
  }
  api.setAccessToken("barrel-contract-token");
  try {
    expect(api.attachAccessToken({}).headers.Authorization).toBe(
      "Bearer barrel-contract-token",
    );
  } finally {
    api.clearAccessToken();
  }
});
