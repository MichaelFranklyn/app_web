import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildSchema, type DocumentNode, validate } from "graphql";
import { describe, expect, it } from "vitest";

/**
 * TESTE DE CONTRATO — front × backend.
 *
 * Valida TODA operação/fragmento GraphQL usada no app_web contra o snapshot do
 * schema do backend (`schema.graphql`, gerado por `npm run schema:pull`). Pega
 * "drift" de contrato que o E2E (com mutations mockadas) NÃO pega: campo
 * renomeado/removido, argumento que mudou de tipo, enum novo, etc.
 *
 * Quando o backend muda: rode `npm run schema:pull` e este teste aponta toda
 * operação do front que ficou inválida.
 *
 * Convenção do projeto: todo documento `gql` vive em um `gql.ts` (verificado:
 * 0 documentos fora desse padrão), então o glob abaixo cobre 100% deles.
 */
const sdl = readFileSync(
  resolve(process.cwd(), "src/__generated__/schema.graphql"),
  "utf8"
);
const schema = buildSchema(sdl);

const modules = import.meta.glob("/src/**/gql.ts", { eager: true }) as Record<
  string,
  Record<string, unknown>
>;

const isDocument = (v: unknown): v is DocumentNode =>
  !!v && typeof v === "object" && (v as { kind?: string }).kind === "Document";

const documents: { file: string; name: string; doc: DocumentNode }[] = [];
for (const [file, mod] of Object.entries(modules)) {
  for (const [exportName, value] of Object.entries(mod)) {
    if (isDocument(value))
      documents.push({ file, name: exportName, doc: value });
  }
}

describe("contrato GraphQL (front × schema do backend)", () => {
  it("coletou os documentos gql do app", () => {
    expect(documents.length).toBeGreaterThan(50);
  });

  it("toda operação é válida contra o schema do backend", () => {
    const violations = documents.flatMap(({ file, name, doc }) => {
      const errors = validate(schema, doc);
      return errors.length
        ? [{ where: `${name} — ${file}`, errors: errors.map((e) => e.message) }]
        : [];
    });
    expect(violations).toEqual([]);
  });
});
