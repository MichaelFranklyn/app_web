import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * GUARDA DE TOKENS — cor de PAPEL se lê pela camada semântica.
 *
 * `globals.css` tem duas camadas: a paleta crua (`--muted`, `--red`,
 * `--warning`…) e os papéis que apontam para ela (`--color-text-muted`,
 * `--color-status-danger`, `--color-status-warning`…). Quem lê a paleta direto
 * amarra a tela ao VALOR: o dia em que "alerta" mudar de cor, cada `--warning`
 * espalhado precisa ser caçado à mão — e o âmbar de ação e o âmbar de alerta
 * já foram a mesma coisa por isso.
 *
 * Catraca por arquivo: o número de tokens crus de papel de cada arquivo não
 * pode crescer, e arquivo novo nasce com zero. Migrou um arquivo? A suíte
 * acusa a sobra; rode `UPDATE_TOKEN_BASELINE=1 npx vitest run tokens.guard`
 * para baixar a base.
 *
 * Fora da regra: cores de MATIZ sem papel (`--purple`, `--cyan`, `--pink`,
 * `--orange`, os `--mod-*` dos módulos), superfícies e bordas (`--bg*`,
 * `--border`) e o âmbar de interação (`--amber`, `--amber2`), que já têm
 * `--color-action`/`--color-focus` mas descrevem estados de hover e foco.
 */

const ROOT = process.cwd();
const SRC = resolve(ROOT, "src");
const BASELINE = resolve(__dirname, "tokens.guard.baseline.json");

/** Token cru → o papel que o substitui. */
const ROLE_OF: Record<string, string> = {
  text: "--color-text",
  text2: "--color-text-secondary",
  muted: "--color-text-muted",
  muted2: "--color-text-disabled",
  "amber-text": "--color-action-text",
  warning: "--color-status-warning",
  "warning-bg": "--color-status-warning-bg",
  "warning-bd": "--color-status-warning-bd",
  red: "--color-status-danger",
  "red-bg": "--color-status-danger-bg",
  "red-bd": "--color-status-danger-bd",
  green: "--color-status-success",
  "green-bg": "--color-status-success-bg",
  "green-bd": "--color-status-success-bd",
  blue: "--color-status-info",
  "blue-bg": "--color-status-info-bg",
  "blue-bd": "--color-status-info-bd",
};

const RAW = new RegExp(
  String.raw`(?<![\w-])--(${Object.keys(ROLE_OF).join("|")})(?![\w-])`,
  "g"
);

function* sourceFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(path);
    else if (/\.(tsx?|css)$/.test(entry.name) && !/\.test\./.test(entry.name))
      yield path;
  }
}

function countRawTokens(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const path of sourceFiles(SRC)) {
    const file = relative(ROOT, path);
    // Onde os papéis são DEFINIDOS: lá a paleta crua é o assunto.
    if (file === "src/styles/globals.css") continue;
    const found = readFileSync(path, "utf8").match(RAW)?.length ?? 0;
    if (found > 0) counts[file] = found;
  }
  return Object.fromEntries(Object.entries(counts).sort());
}

describe("tokens: cor de papel pela camada semântica", () => {
  const current = countRawTokens();

  if (process.env.UPDATE_TOKEN_BASELINE) {
    writeFileSync(BASELINE, JSON.stringify(current, null, 2) + "\n");
  }
  const baseline: Record<string, number> = JSON.parse(
    readFileSync(BASELINE, "utf8")
  );

  it("nenhum arquivo ganha token cru de papel", () => {
    const grew = Object.entries(current)
      .filter(([file, n]) => n > (baseline[file] ?? 0))
      .map(([file, n]) => `${file}: ${baseline[file] ?? 0} → ${n}`);
    expect(
      grew,
      "Use o papel em vez da paleta crua:\n" +
        Object.entries(ROLE_OF)
          .map(([raw, role]) => `  --${raw} → ${role}`)
          .join("\n")
    ).toEqual([]);
  });

  it("a base acompanha a migração (sem folga esquecida)", () => {
    const slack = Object.entries(baseline)
      .filter(([file, n]) => (current[file] ?? 0) < n)
      .map(([file, n]) => `${file}: base ${n}, hoje ${current[file] ?? 0}`);
    expect(
      slack,
      "Baixe a base: UPDATE_TOKEN_BASELINE=1 npx vitest run tokens.guard"
    ).toEqual([]);
  });
});
