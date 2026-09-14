/** @module scripts/dev/scaffold
 * @description Collision-safe generators for the template's module and barrel conventions.
 */
import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  realpath,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
/**
 * Generate one module and its colocated test without overwriting existing work.
 * @param {string} kind component, page, api, or server-module.
 * @param {string} name Valid module identifier.
 * @param {string} [root] Repository root; injectable for isolated generator tests.
 * @returns {Promise<string>} Generated directory.
 */
export async function scaffold(kind, name, root = repositoryRoot) {
  const groups = {
    component: "client/src/components/parts",
    page: "client/src/components/pages",
    api: "client/src/api",
    "server-module": "app/services",
  };
  if (
    !groups[kind] ||
    typeof name !== "string" ||
    !/^[A-Za-z][A-Za-z0-9]*$/u.test(name) ||
    /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/iu.test(name)
  )
    throw new Error(
      "Use a supported module kind and an alphanumeric module name",
    );
  const component = kind === "component" || kind === "page";
  if (component && !/^[A-Z]/u.test(name))
    throw new Error(
      "Component and page names must begin with an uppercase letter",
    );
  const group = path.join(root, groups[kind]);
  const resolvedRoot = await realpath(root);
  const resolvedGroup = await realpath(group);
  if (!resolvedGroup.startsWith(resolvedRoot + path.sep))
    throw new Error("Module group must stay inside the repository");
  if (
    (await readdir(group)).some(
      (entry) => entry.toLowerCase() === name.toLowerCase(),
    )
  )
    throw new Error("A module with this name already exists");
  const barrelPath = path.join(group, "index.js");
  const barrel = await readFile(barrelPath, "utf8");
  if (!/^[\s\S]*@module/u.test(barrel))
    throw new Error("Parent barrel requires module documentation");
  const extension = component ? "jsx" : "js";
  const exportName =
    kind === "server-module"
      ? `create${name[0].toUpperCase()}${name.slice(1)}`
      : name;
  const comment = `/** @module ${kind}.${name}\n * @description Extension point for ${name}; define its domain contract before adding behavior.\n */\n`;
  const implementation = component
    ? `${comment}/** Render ${name}.\n * @returns {JSX.Element} Semantic content.\n */\nexport default function ${name}() { return <section className="ui-card ly-stack"><h2>${name}</h2></section>; }\n`
    : kind === "api"
      ? `${comment}/** Create request options without executing a request.\n * @param {Object} [options] Caller options.\n * @returns {Object} Request options.\n */\nexport function ${name}(options = {}) { return { ...options }; }\n`
      : `${comment}/** Compose this module's public operations.\n * @returns {Object} Extension interface.\n */\nfunction ${exportName}() { return Object.freeze({}); }\nmodule.exports = { ${exportName} };\n`;
  const test = component
    ? `${comment}import { render, screen } from "@testing-library/react";\nimport { expect, it } from "vitest";\nimport ${name} from "./${name}.jsx";\nit("renders an accessible ${name} heading", () => { render(<${name} />); expect(screen.getByRole("heading", { name: "${name}" })).toBeInTheDocument(); });\n`
    : `${comment}${kind === "api" ? 'import { it } from "vitest";' : 'const { it } = require("node:test");'}\nit.todo("Define and implement the ${name} domain acceptance criterion");\n`;
  let routePath;
  let routes;
  if (kind === "page") {
    routePath = path.join(root, "shared/routes.json");
    routes = JSON.parse(await readFile(routePath, "utf8"));
    const url =
      "/" + name.replace(/([a-z0-9])([A-Z])/gu, "$1-$2").toLowerCase();
    if (routes.some((route) => route.path === url))
      throw new Error("A page route already exists");
    routes.push({
      path: url,
      component: name,
      title: name,
      label: name,
      access: "public",
      indexable: false,
      primary: false,
    });
  }
  const target = path.join(group, name);
  const addition = component
    ? `\nimport ${name} from "./${name}/${name}.jsx";\nexport { ${name} };\n`
    : kind === "api"
      ? `\nexport { ${name} } from "./${name}/${name}.js";\n`
      : `\nconst { ${exportName} } = require("./${name}/${name}.js");\nmodule.exports.${exportName} = ${exportName};\n`;
  /** Apply the target repository's formatter before writing generated source.
   * @param {string} source Source text.
   * @param {string} filepath Destination used for parser and configuration discovery.
   * @returns {Promise<string>} Formatted source.
   */
  async function formatted(source, filepath) {
    return format(source, { ...(await resolveConfig(filepath)), filepath });
  }
  const implementationPath = path.join(target, `${name}.${extension}`);
  const testPath = path.join(target, `${name}.test.${extension}`);
  const formattedImplementation = await formatted(
    implementation,
    implementationPath,
  );
  const formattedTest = await formatted(test, testPath);
  const formattedBarrel = await formatted(barrel + addition, barrelPath);
  await mkdir(target);
  await writeFile(implementationPath, formattedImplementation, { flag: "wx" });
  await writeFile(testPath, formattedTest, { flag: "wx" });
  await writeFile(barrelPath, formattedBarrel);
  if (routes)
    await writeFile(routePath, JSON.stringify(routes, null, 2) + "\n");
  return target;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    process.stdout.write(
      (await scaffold(process.argv[2], process.argv[3])) + "\n",
    );
  } catch (error) {
    process.stderr.write(error.message + "\n");
    process.exitCode = 1;
  }
}
