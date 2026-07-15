import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import openapiTS, { astToString } from "openapi-typescript";

const schemaTarget = resolve("src/lib/api/generated/openapi-schema.ts");
const pathsTarget = resolve("src/lib/api/generated/openapi-paths.ts");
const checkOnly = process.argv.includes("--check");

async function documentSource() {
  if (process.env.OPENAPI_FILE) {
    const source = resolve(process.env.OPENAPI_FILE);
    return { input: JSON.parse(await readFile(source, "utf8")), document: JSON.parse(await readFile(source, "utf8")) };
  }
  const url = new URL(process.env.OPENAPI_URL ?? "http://localhost:8080/v3/api-docs");
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`OpenAPI request failed: ${response.status} ${response.statusText}`);
  const document = await response.json();
  return { input: document, document };
}

function normalizeClientPath(path) {
  const normalized = path.replace(/^\/api(?=\/|$)/, "");
  return normalized || "/";
}

function renderPaths(document) {
  const paths = Object.keys(document.paths ?? {})
    .map(normalizeClientPath)
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort((left, right) => left.localeCompare(right));
  return `/* eslint-disable */\n// Generated from backend OpenAPI. Do not edit manually.\n\nexport const openApiClientPathTemplates = [\n${paths.map((path) => `  ${JSON.stringify(path)},`).join("\n")}\n] as const;\n\nexport type OpenApiClientPathTemplate = (typeof openApiClientPathTemplates)[number];\n`;
}

async function writeOrCheck(target, output) {
  if (checkOnly) {
    const current = await readFile(target, "utf8");
    if (current !== output) throw new Error(`${target} is stale. Run bun run api:contract:generate.`);
    return;
  }
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, output, "utf8");
}

const { input, document } = await documentSource();
const schemaAst = await openapiTS(input, {
  alphabetize: true,
  defaultNonNullable: false,
  enum: true,
  exportType: true,
  immutable: true,
  pathParamsAsTypes: true,
});
await writeOrCheck(schemaTarget, `/* eslint-disable */\n// Generated from backend OpenAPI. Do not edit manually.\n${astToString(schemaAst)}`);
await writeOrCheck(pathsTarget, renderPaths(document));
console.log(checkOnly ? "OpenAPI DTO and operation contract is current." : "Generated full OpenAPI DTO and operation contract.");
