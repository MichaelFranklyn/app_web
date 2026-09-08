"use client";

import { Title } from "@/components/Title";
import { Info } from "lucide-react";

import { ignoresMonth, scopeSentence } from "../../help";
import {
  type CommissionAudience,
  CommissionTab,
  monthLabel,
  YearMonth,
} from "../../utils";

interface Props {
  tab: CommissionTab;
  month: YearMonth;
  /**
   * De quem é o dinheiro que a lista soma. Só vem quando a tela oferece as duas
   * óticas (gestor) — para o vendedor a frase é a neutra, porque a comissão
   * dele não precisa de qualificativo.
   */
  audience?: CommissionAudience;
  /** Parcelas que a lista abaixo mostra, depois de mês, situação e filtros. */
  shown: number;
  /** Total do mês antes do painel de filtros — some quando nada foi filtrado. */
  total?: number;
}

/**
 * Uma frase, sempre visível, dizendo o que a lista abaixo está somando.
 *
 * É a resposta para a queixa mais cara desta tela: o mês (lá em cima) e a
 * situação (nas abas) não governam as mesmas coisas, e quem não sabe disso
 * conclui que os números se contradizem. Antes, isso só era dito na aba de
 * boletos travados, e num alerta grande — as outras quatro deixavam o leitor
 * adivinhar.
 *
 * A aba que ignora o mês continua se destacando (âmbar), porque ali a lista
 * realmente não bate com os cartões de cima e isso precisa saltar.
 */
export function ListScopeLine({ tab, month, audience, shown, total }: Props) {
  const foraDoMes = ignoresMonth(tab);
  const filtrado = total !== undefined && total !== shown;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <Info
        size={14}
        className={foraDoMes ? "text-(--amber)" : "text-(--fg-muted)"}
      />
      <Title variant="caption" color={foraDoMes ? "amber" : "muted"}>
        {scopeSentence(tab, monthLabel(month), audience)}
      </Title>
      <Title variant="caption" color="muted">
        ·{" "}
        {filtrado
          ? `${shown} de ${total} parcela(s) após os filtros`
          : `${shown} parcela(s)`}
      </Title>
    </div>
  );
}
