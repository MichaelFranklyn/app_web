// Gera o snapshot do schema GraphQL do backend (app_user, Ariadne schema-first)
// em src/__generated__/schema.graphql. O backend espalha o SDL em vários
// `.graphql` por módulo + um base.graphql com os root types e scalars; o
// Ariadne faz `load_schema_from_path(app_user/app)` (merge recursivo). Aqui
// replicamos esse merge para versionar o contrato dentro do app_web.
//
// Uso: BACKEND_SCHEMA_DIR=../app_user/app node scripts/pull-schema.mjs
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSchema } from "graphql";

const here = dirname(fileURLToPath(import.meta.url));
const BACKEND = resolve(
  here,
  "..",
  process.env.BACKEND_SCHEMA_DIR ?? "../app_user/app"
);
const OUT = resolve(here, "../src/__generated__/schema.graphql");

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (entry.name.endsWith(".graphql")) acc.push(p);
  }
  return acc;
}

const files = walk(BACKEND).sort();
// base.graphql primeiro: define `type Query`/`type Mutation` que os módulos `extend`.
files.sort((a, b) =>
  a.includes("core/graphql/base") ? -1 : b.includes("core/graphql/base") ? 1 : 0
);

const sdl = files.map((f) => readFileSync(f, "utf8").trim()).join("\n\n");

// Falha cedo se o merge não formar um schema válido.
buildSchema(sdl);

const header = `# AUTO-GERADO por scripts/pull-schema.mjs — NÃO editar à mão.
# Snapshot do schema do backend (app_user). Atualize com: npm run schema:pull
# Fonte: ${files.length} arquivos .graphql merge-ados (mesma regra do Ariadne).\n\n`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, header + sdl + "\n");
console.log(`schema:pull OK → ${OUT} (${files.length} arquivos, ${sdl.length} chars)`);
