import { scoreBarColor } from "@/utils/score";
import { ReactNode } from "react";

// Fallback de cor da ScoreCell quando `color` não é passado. Escala de urgência
// única do app: score alto = quente/vermelho, baixo = verde. Delega a
// utils/score.ts em vez de repetir os limiares — a duplicação já divergiu uma
// vez, quando as faixas passaram de 61/41/21 para 45/30/12.
export function deriveScoreColor(
  score: number
): "red" | "orange" | "amber" | "green" {
  return scoreBarColor(score);
}

/**
 * A partir de quantos caracteres o texto de uma célula pode quebrar linha.
 *
 * Abaixo disto é dado curto ("vence hoje", "Em aberto", uma data): quebrá-lo
 * não devolve largura que preste e deixa a coluna com cara de defeito.
 */
export const WRAP_MIN_CHARS = 28;

/**
 * O que liga a quebra de linha — só a partir do desktop.
 *
 * `min-w`: a coluna cede até um piso, não até a maior palavra. Sem ele uma
 * razão social de 60 letras viraria uma tira de cinco linhas; com ele fica em
 * duas, e se nem assim a tabela couber, quem volta a ceder é a rolagem.
 */
export const tableWrapStyle = "desktop:whitespace-normal desktop:min-w-[220px]";

/** Quantas letras o conteúdo tem, quando ele é TEXTO; `null` se há elemento. */
const textLength = (children: ReactNode): number | null => {
  if (typeof children === "string" || typeof children === "number") {
    return String(children).length;
  }
  if (Array.isArray(children)) {
    let total = 0;
    for (const child of children) {
      if (child === null || child === undefined || typeof child === "boolean") {
        continue;
      }
      const length = textLength(child);
      if (length === null) return null;
      total += length;
    }
    return total;
  }
  return null;
};

/**
 * O texto desta célula é longo o bastante para quebrar linha no desktop?
 *
 * No desktop a tabela deixou de rolar para o lado por causa de um nome
 * comprido: quem cede passa a ser o TEXTO LONGO (nome do cliente, motivo), que
 * desce para a segunda linha. Número, data, etiqueta e texto curto seguem em
 * uma linha só — a régua é o tamanho, e não a coluna, para valer em toda
 * tabela sem ninguém marcar célula por célula. No celular e no tablet nada
 * muda: lá a rolagem lateral é gesto natural e a célula segue `nowrap`.
 */
export const isLongCellText = (children: ReactNode): boolean =>
  (textLength(children) ?? 0) > WRAP_MIN_CHARS;
