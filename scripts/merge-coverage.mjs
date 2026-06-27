// Cobertura UNIFICADA do app_web — UMA % de linha para o app inteiro.
//
// Funde duas fontes que cobrem andares diferentes do código:
//   • vitest (V8→json-summary): TODO o src no denominador (componentes nunca
//     carregados contam como 0%). É a régua do tamanho real do app.
//   • E2E browser: a cobertura V8 do Chromium (coverage/e2e-v8/*.json) é
//     convertida para src/** com v8-to-istanbul usando os source maps do build
//     COVERAGE (.next-e2e/static/chunks/*.map). Cobre componentes/páginas client
//     que o Playwright exercitou.
//
// União por ARQUIVO: denominador = total do vitest (conta tudo); por arquivo,
// covered = max(vitest, browser) limitado ao total. vitest cobre utils/hooks e
// o browser cobre componentes — sobreposição ~nula, então a união por-arquivo é
// precisa (só subconta se os DOIS cobrirem linhas DIFERENTES do mesmo arquivo).
//
// LIMITE HONESTO: V8 do browser só vê arquivos client CARREGADOS; Server
// Components (RSC) rodam no servidor e não passam pelo browser, e o
// NODE_V8_COVERAGE do `next start` não é coletável (Playwright mata o processo
// sem flush). RSC entram no denominador (via vitest) mas sem cobertura → este é
// um PISO honesto da cobertura real do app.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import v8toIstanbul from "v8-to-istanbul";
import libCoverage from "istanbul-lib-coverage";

const ROOT = resolve(process.cwd());
const DIST = join(ROOT, ".next-e2e");
const norm = (p) => (p.includes("/src/") ? "src/" + p.split("/src/").pop() : p);
const SRC_OK = (p) =>
  p.includes("src/") &&
  !p.includes("node_modules") &&
  !/\.(test|spec)\.[tj]sx?$/.test(p) &&
  !/\/(gql|interface)\.ts$/.test(p) &&
  !p.includes("/__generated__/") &&
  !p.includes("/utils/mocks/"); // fixtures de teste — já excluídos no vitest.config

// ── base: vitest (denominador completo do app) ──
const vitestSummary = JSON.parse(
  readFileSync(join(ROOT, "coverage/vitest-raw/coverage-summary.json"), "utf8")
);
const files = new Map(); // src-path → { total, covered }
for (const [p, d] of Object.entries(vitestSummary)) {
  if (p === "total" || !SRC_OK(p)) continue;
  files.set(norm(p), { total: d.lines.total, covered: d.lines.covered });
}

// ── E2E browser: V8 → istanbul (src) via source maps, unido entre os testes ──
const coverageMap = libCoverage.createCoverageMap({});
const mapCache = new Map(); // diskPath → parsed sourcemap (ou null)
const e2eDir = join(ROOT, "coverage/e2e-v8");
let entriesConverted = 0;

const diskFor = (url) => {
  try {
    const { pathname } = new URL(url);
    // Next serve /_next/static/* a partir de <distDir>/static/*.
    return join(DIST, pathname.replace(/^\/_next\//, ""));
  } catch {
    return null;
  }
};

if (existsSync(e2eDir)) {
  for (const f of readdirSync(e2eDir).filter((x) => x.endsWith(".json"))) {
    const entries = JSON.parse(readFileSync(join(e2eDir, f), "utf8"));
    for (const e of entries) {
      if (!e?.url || !/\.js(\?|$)/.test(e.url) || !e.source || !Array.isArray(e.functions)) continue;
      const disk = diskFor(e.url);
      if (!disk || !existsSync(disk)) continue;
      // Turbopack nomeia o .map por hash de conteúdo (≠ nome do chunk) — o nome
      // real está no comentário sourceMappingURL embutido na própria source.
      const m = e.source.match(/sourceMappingURL=(\S+)/);
      if (!m) continue;
      const mapPath = join(dirname(disk), m[1].trim());
      if (!mapCache.has(mapPath)) {
        mapCache.set(mapPath, existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, "utf8")) : null);
      }
      const sourcemap = mapCache.get(mapPath);
      if (!sourcemap) continue; // sem map não dá p/ voltar ao src
      try {
        const conv = v8toIstanbul(disk, 0, { source: e.source, sourceMap: { sourcemap } });
        await conv.load();
        conv.applyCoverage(e.functions);
        const ist = conv.toIstanbul();
        for (const [fp, fc] of Object.entries(ist)) {
          if (!SRC_OK(fp)) continue;
          coverageMap.addFileCoverage(fc); // mesmo produtor → merge correto entre testes
        }
        entriesConverted++;
      } catch {
        // chunk sem mapeamento utilizável; ignora
      }
    }
  }
}

// overlay browser → base (max covered, total do vitest)
let browserFiles = 0;
for (const fp of coverageMap.files()) {
  const key = norm(fp);
  if (!SRC_OK(key)) continue;
  const cov = coverageMap.fileCoverageFor(fp).toSummary().lines.covered;
  const base = files.get(key);
  if (base) base.covered = Math.min(base.total, Math.max(base.covered, cov));
  else files.set(key, { total: coverageMap.fileCoverageFor(fp).toSummary().lines.total, covered: cov });
  browserFiles++;
}

let total = 0;
let covered = 0;
for (const d of files.values()) {
  total += d.total;
  covered += d.covered;
}
const pct = total ? ((covered / total) * 100).toFixed(2) : "0.00";

console.log("\n──────── Cobertura UNIFICADA do app_web (src/**) ────────");
console.log(`vitest: denominador de ${files.size} arquivos (${total} linhas)`);
console.log(`E2E browser: ${entriesConverted} chunks convertidos → ${browserFiles} arquivos src com cobertura`);
console.log(`Linhas cobertas (união): ${covered} / ${total}`);
console.log(`\n  ►  LINHA ÚNICA DO APP: ${pct}%\n`);
console.log("─────────────────────────────────────────────────────────");
