import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import v8toIstanbul from "v8-to-istanbul";
import libCoverage from "istanbul-lib-coverage";

const ROOT = resolve(process.cwd());
const DIST = join(ROOT, ".next-e2e");
const norm = (p) => (p.includes("/src/") ? "src/" + p.split("/src/").pop() : p);
const SRC_OK = (p) =>
  p.includes("src/") && !p.includes("node_modules") &&
  !/\.(test|spec)\.[tj]sx?$/.test(p) &&
  !/\/(gql|interface)\.ts$/.test(p) && !p.includes("/__generated__/") &&
  !p.includes("/utils/mocks/");

const vitestSummary = JSON.parse(readFileSync(join(ROOT, "coverage/vitest-raw/coverage-summary.json"), "utf8"));
const files = new Map();
for (const [p, d] of Object.entries(vitestSummary)) {
  if (p === "total" || !SRC_OK(p)) continue;
  files.set(norm(p), { total: d.lines.total, covered: d.lines.covered });
}

const coverageMap = libCoverage.createCoverageMap({});
const mapCache = new Map();
const e2eDir = join(ROOT, "coverage/e2e-v8");
const diskFor = (url) => { try { const { pathname } = new URL(url); return join(DIST, pathname.replace(/^\/_next\//, "")); } catch { return null; } };
if (existsSync(e2eDir)) {
  for (const f of readdirSync(e2eDir).filter((x) => x.endsWith(".json"))) {
    const entries = JSON.parse(readFileSync(join(e2eDir, f), "utf8"));
    for (const e of entries) {
      if (!e?.url || !/\.js(\?|$)/.test(e.url) || !e.source || !Array.isArray(e.functions)) continue;
      const disk = diskFor(e.url); if (!disk || !existsSync(disk)) continue;
      const m = e.source.match(/sourceMappingURL=(\S+)/); if (!m) continue;
      const mapPath = join(dirname(disk), m[1].trim());
      if (!mapCache.has(mapPath)) mapCache.set(mapPath, existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, "utf8")) : null);
      const sourcemap = mapCache.get(mapPath); if (!sourcemap) continue;
      try {
        const conv = v8toIstanbul(disk, 0, { source: e.source, sourceMap: { sourcemap } });
        await conv.load(); conv.applyCoverage(e.functions);
        const ist = conv.toIstanbul();
        for (const [fp, fc] of Object.entries(ist)) { if (!SRC_OK(fp)) continue; coverageMap.addFileCoverage(fc); }
      } catch {}
    }
  }
}
for (const fp of coverageMap.files()) {
  const key = norm(fp); if (!SRC_OK(key)) continue;
  const cov = coverageMap.fileCoverageFor(fp).toSummary().lines.covered;
  const base = files.get(key);
  if (base) base.covered = Math.min(base.total, Math.max(base.covered, cov));
  else files.set(key, { total: coverageMap.fileCoverageFor(fp).toSummary().lines.total, covered: cov });
}
const rows = [];
for (const [k, d] of files.entries()) rows.push({ k, total: d.total, covered: d.covered, uncov: d.total - d.covered });
rows.sort((a, b) => b.uncov - a.uncov);
console.log("UNCOV  COV/TOT  FILE");
for (const r of rows.slice(0, 200)) {
  if (r.uncov === 0) continue;
  console.log(`${String(r.uncov).padStart(5)}  ${r.covered}/${r.total}`.padEnd(20) + "  " + r.k);
}
const totUncov = rows.reduce((s, r) => s + r.uncov, 0);
console.log(`\nTotal uncovered: ${totUncov} lines across ${rows.filter(r=>r.uncov>0).length} files`);
