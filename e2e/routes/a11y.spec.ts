import path from "node:path";
import type { Page } from "@playwright/test";
import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { PAGE_DATA, PAGE_READY } from "../support/pageData";

/**
 * Acessibilidade das telas principais (auditoria UX de 13/11/2026, seção 14).
 *
 * Roda o axe-core em cada tela e FALHA em violação `serious` ou `critical`.
 * As de impacto `minor`/`moderate` não travam: são, em sua maioria, opinião
 * de boas práticas e não barram o uso.
 *
 * O que já pegou na auditoria e esta guarda impede de voltar:
 *  - âmbar sobre fundo tingido abaixo de 4,5:1 (color-contrast, P-14.1);
 *  - barra de progresso sem nome (aria-progressbar-name, P-14.2);
 *  - Tabs sem painel com `aria-controls` apontando para o nada
 *    (aria-valid-attr-value, critical, P-14.3).
 *
 * Telas COM dados usam o mesmo mock e o mesmo "texto de pronto" do
 * responsive-pages.spec: contraste e nome acessível moram no conteúdo (linha
 * de tabela, selo, aba ativa), e uma tela vazia esconderia quase tudo.
 */
const AXE_PATH = path.join(
  process.cwd(),
  "node_modules",
  "axe-core",
  "axe.min.js"
);

/** Telas principais com conteúdo mockado (subconjunto do PAGE_DATA). */
const COM_DADOS = [
  "/commissions",
  "/goals",
  "/priorities/opportunities",
  "/orders/order-1",
  "/clients/cc-1/overview",
  "/factories/factory-1/products",
  "/dashboard/reports/billing",
];

/** Telas principais abertas sem dado: o estado vazio também é lido. */
const VAZIAS = [
  "/dashboard",
  "/clients",
  "/factories",
  "/orders",
  "/agenda",
  "/settings",
];

/**
 * Exceção de contraste DECIDIDA pelo dono do produto em 18/11/2026: a marca é
 * o âmbar `--amber` (#c97f0a) com texto branco (`--color-on-action`), que dá
 * 3,2:1 — abaixo dos 4,5:1 do AA para texto normal. Texto escuro sobre o âmbar
 * foi proposto e recusado duas vezes. A guarda libera SÓ este par (botão
 * primário, aba ativa); qualquer outra combinação abaixo do AA continua
 * travando. Se a marca mudar, apague esta exceção.
 */
const CONTRASTE_ACEITO = { fgColor: "#ffffff", bgColor: "#c97f0a" };

interface AxeNode {
  target: string[];
  failureSummary?: string;
  contrast?: { fgColor?: string; bgColor?: string };
}

interface AxeViolation {
  id: string;
  impact: string | null;
  help: string;
  nodes: AxeNode[];
}

function contrasteAceito(violacao: AxeViolation, node: AxeNode) {
  return (
    violacao.id === "color-contrast" &&
    node.contrast?.fgColor === CONTRASTE_ACEITO.fgColor &&
    node.contrast?.bgColor === CONTRASTE_ACEITO.bgColor
  );
}

async function rodarAxe(page: Page): Promise<AxeViolation[]> {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async () => {
    const axe = (
      window as unknown as {
        axe: {
          run: (
            ctx: Document,
            opts: Record<string, unknown>
          ) => Promise<{ violations: unknown[] }>;
        };
      }
    ).axe;
    const result = await axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      },
      resultTypes: ["violations"],
    });
    return (result.violations as AxeViolation[]).map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: (
        v.nodes as unknown as {
          target: string[];
          failureSummary?: string;
          any?: { data?: { fgColor?: string; bgColor?: string } }[];
        }[]
      ).map((n) => ({
        target: n.target,
        failureSummary: n.failureSummary,
        contrast: n.any?.[0]?.data
          ? {
              fgColor: n.any[0].data.fgColor,
              bgColor: n.any[0].data.bgColor,
            }
          : undefined,
      })),
    }));
  });
}

/** Tira os nós do par de contraste aceito; violação sem nó restante some. */
function semExcecoes(violacoes: AxeViolation[]) {
  return violacoes
    .map((v) => ({
      ...v,
      nodes: v.nodes.filter((n) => !contrasteAceito(v, n)).slice(0, 5),
    }))
    .filter((v) => v.nodes.length > 0);
}

function descrever(url: string, violacoes: AxeViolation[]) {
  return [
    `${url}: ${violacoes.length} violação(ões) serious/critical`,
    ...violacoes.map(
      (v) =>
        `  • [${v.impact}] ${v.id} — ${v.help}\n` +
        v.nodes.map((n) => `      ${n.target.join(" ")}`).join("\n")
    ),
  ].join("\n");
}

async function verificar(page: Page, url: string) {
  await expect(page.locator("main")).toBeVisible();
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  const graves = semExcecoes(await rodarAxe(page)).filter(
    (v) => v.impact === "serious" || v.impact === "critical"
  );
  expect(graves, descrever(url, graves)).toEqual([]);
}

test.describe("acessibilidade (axe) — telas principais", () => {
  for (const url of COM_DADOS) {
    test(`com conteúdo: ${url}`, async ({ page }) => {
      await mockGraphql(page, PAGE_DATA[url] ?? {});
      await page.goto(url);
      const pronta = PAGE_READY[url];
      if (pronta) {
        await expect(
          page.locator("main").getByText(pronta).first()
        ).toBeVisible();
      }
      await verificar(page, url);
    });
  }

  for (const url of VAZIAS) {
    test(`vazia: ${url}`, async ({ page }) => {
      await mockGraphql(page, {});
      await page.goto(url);
      await verificar(page, url);
    });
  }
});
