import type { Page } from "@playwright/test";

/**
 * Como uma tela quebra em telefone pequeno — e como NÃO quebra.
 *
 * Três coisas diferentes:
 *  - `overflowPagina`: a página inteira rola para o lado. É o pior caso.
 *  - `largos`: um bloco mais largo que a tela SEM ancestral rolável. A tabela
 *    larga não conta: ela vive dentro de um `overflow-x-auto` e rolar é a
 *    solução, não o defeito.
 *  - `clipados`: conteúdo maior que uma caixa `overflow-hidden` — o corte
 *    silencioso, que a medição da página não vê justamente porque o pai já
 *    cortou. Foi assim que a descrição do estado vazio saía pela metade dentro
 *    da célula `whitespace-nowrap`. Transbordo com `overflow: visible` não
 *    entra: ali o conteúdo continua à vista (e a sangria com `-mx` é comum).
 *
 * Corte deliberado (`truncate`, `line-clamp`, `sr-only`) não entra: ali o corte
 * é o design.
 */
export interface LayoutProblemas {
  overflowPagina: number;
  largos: string[];
  clipados: string[];
}

export async function medirLayout(page: Page): Promise<LayoutProblemas> {
  return page.evaluate(() => {
    const de = document.documentElement;
    const vw = de.clientWidth;

    const descreve = (el: Element) => {
      const cls =
        typeof (el as HTMLElement).className === "string"
          ? (el as HTMLElement).className.slice(0, 60)
          : "";
      const txt = ((el as HTMLElement).innerText ?? "").slice(0, 25);
      return `${el.tagName.toLowerCase()}[${cls}]{${txt.replace(/\n/g, " ")}}`;
    };

    const dentroDeRolagem = (el: Element) => {
      let p: Element | null = el.parentElement;
      while (p && p !== document.body) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === "auto" || ox === "scroll") return true;
        p = p.parentElement;
      }
      return false;
    };

    const largos: string[] = [];
    const clipados: string[] = [];

    document.querySelectorAll<HTMLElement>("main *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height <= 0) return;

      if (r.width > vw + 1 && !dentroDeRolagem(el)) {
        largos.push(`${descreve(el)} w=${Math.round(r.width)}`);
      }

      const excedente = el.scrollWidth - el.clientWidth;
      if (excedente <= 2) return;
      const estilo = getComputedStyle(el);
      // Só `hidden`/`clip` ESCONDEM o excedente. Com `visible` o conteúdo
      // transborda e continua à vista — é o que faz a barra fixa do portal
      // sangrar até a borda com `-mx`, de propósito. Rolagem também não é
      // defeito: é a saída.
      if (estilo.overflowX !== "hidden" && estilo.overflowX !== "clip") return;
      const cls = typeof el.className === "string" ? el.className : "";
      const corteProposital =
        cls.includes("truncate") ||
        cls.includes("line-clamp") ||
        cls.includes("sr-only") ||
        estilo.textOverflow === "ellipsis" ||
        (estilo.position === "absolute" && el.clientWidth <= 1);
      if (!corteProposital) {
        clipados.push(`${descreve(el)} +${excedente}px`);
      }
    });

    return {
      overflowPagina: de.scrollWidth - de.clientWidth,
      largos: [...new Set(largos)].slice(0, 5),
      clipados: [...new Set(clipados)].slice(0, 5),
    };
  });
}

/** Mensagem de falha que diz ONDE apertar, não só que apertou. */
export function descreveProblemas(url: string, p: LayoutProblemas): string {
  return [
    `${url} não cabe na tela:`,
    p.overflowPagina > 1
      ? `  página rola ${p.overflowPagina}px para o lado`
      : "",
    p.largos.length ? `  largos demais:\n    ${p.largos.join("\n    ")}` : "",
    p.clipados.length
      ? `  cortados sem rolagem:\n    ${p.clipados.join("\n    ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
