"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { Building2 } from "lucide-react";
import { useMemo } from "react";

import { OFFICE_SPLIT_HELP } from "../../help";
import { CommissionRow } from "../../interface";
import { monthLabel, officeSplit, YearMonth } from "../../utils";

interface Props {
  /** Linhas do mês, do vendedor escolhido — a repartição é sobre elas. */
  rows: CommissionRow[];
  month: YearMonth;
  /** Vendedor escolhido no seletor: a repartição é dele, não da empresa toda. */
  sellerName: string | null;
}

/**
 * Quanto da comissão do mês fica com o escritório, em UMA linha.
 *
 * São dois acordos empilhados — a fábrica paga o escritório, o escritório
 * repassa uma fatia ao vendedor — e a tela só mostrava o número de cima. Quem
 * gerencia precisa do de baixo para saber o que sobra, e é uma conta que não
 * dava para fazer de cabeça: a fatia varia por vendedor E por fábrica.
 *
 * Nasceu como três cartões e virou uma linha: empilhados sob os três KPIs do
 * mês, eles disputavam a mesma leitura e a tela virou um paredão de números.
 * Aqui a informação é a mesma e o peso visual é o de uma legenda — que é o que
 * ela é, um detalhamento do "a receber" logo acima.
 *
 * Só para gestão: na visão do vendedor, `amount` já É a parte dele e a
 * diferença daria zero.
 */
export function OfficeSplitPanel({ rows, month, sellerName }: Props) {
  const split = useMemo(() => officeSplit(rows, month), [rows, month]);

  // Mês sem nenhuma comissão do escritório: três zeros não dizem nada.
  if (split.count === 0) return null;

  // Taxa nula no vínculo = o vendedor leva a comissão inteira, que é o padrão
  // de quem nunca definiu a divisão. Sem dizer isso, a linha parece anunciar um
  // mês em que o escritório não ganhou nada.
  const semDivisao = split.office === 0 && split.company !== 0;

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-(--r-md) bg-(--bg3) px-16 py-12">
      <Building2 size={14} className="shrink-0 text-(--fg-muted)" />

      <Title variant="body-sm" color="muted">
        Do que cai em {monthLabel(month)}
        {sellerName ? ` com ${sellerName}` : ""}:
      </Title>

      <Title variant="body-sm" weight="semibold">
        {formatMoney(split.company)}
      </Title>
      <Title variant="body-sm" color="muted">
        das fábricas
      </Title>

      <Title variant="body-sm" color="muted">
        ·
      </Title>

      <Title variant="body-sm" weight="semibold" color="amber">
        {formatMoney(split.seller)}
      </Title>
      <Title variant="body-sm" color="muted">
        de repasse
      </Title>

      <Title variant="body-sm" color="muted">
        ·
      </Title>

      <Title
        variant="body-sm"
        weight="semibold"
        color={semDivisao ? undefined : "green"}
      >
        {formatMoney(split.office)}
      </Title>
      <Title variant="body-sm" color="muted">
        {semDivisao
          ? "no escritório (o vendedor leva a comissão inteira — defina a taxa dele no vínculo com a fábrica)"
          : `no escritório (${Math.round(split.margin * 100)}%)`}
      </Title>

      <HelpTooltip
        label="Como a repartição é calculada"
        content={OFFICE_SPLIT_HELP}
      />
    </div>
  );
}
