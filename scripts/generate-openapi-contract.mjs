import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const target = resolve("src/lib/api/generated/openapi-paths.ts");
const checkOnly = process.argv.includes("--check");

async function readOpenApiDocument() {
  if (process.env.OPENAPI_FILE) {
    return JSON.parse(await readFile(resolve(process.env.OPENAPI_FILE), "utf8"));
  }

  const url = process.env.OPENAPI_URL ?? "http://localhost:8080/v3/api-docs";
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`OpenAPI request failed with ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function normalizeClientPath(path) {
  const normalized = path.replace(/^\/api(?=\/|$)/, "");
  return normalized || "/";
}

function render(document) {
  const paths = Object.keys(document.paths ?? {})
    .map(normalizeClientPath)
    .filter((path, index, all) => all.indexOf(path) === index)
    .sort((left, right) => left.localeCompare(right));

  const lines = paths.map((path) => `  ${JSON.stringify(path)},`).join("\n");
  return `/* eslint-disable */\n// Generated from the backend OpenAPI document. Run \`bun run api:contract:generate\`.\n\nexport const openApiClientPathTemplates = [\n${lines}\n] as const;\n\nexport type OpenApiClientPathTemplate = (typeof openApiClientPathTemplates)[number];\n`;
}

const output = render(await readOpenApiDocument());
if (checkOnly) {
  const existing = await readFile(target, "utf8");
  if (existing !== output) {
    console.error("Frontend API contract is stale. Run `bun run api:contract:generate` against the backend OpenAPI document.");
    process.exit(1);
  }
  console.log("Frontend API contract matches backend OpenAPI.");
} else {
  await writeFile(target, output, "utf8");
  console.log(`Generated ${target}`);
}
