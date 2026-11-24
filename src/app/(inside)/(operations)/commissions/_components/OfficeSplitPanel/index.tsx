"use client";
import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";
import { TextLink } from "@/components/TextLink";

import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { Building2 } from "lucide-react";

import { monthLabel, type OfficeSplit, YearMonth } from "../../utils";
import { formatPercent } from "@/utils/format/percent";
import { ICON_SIZE } from "@/components/Icon";

interface Props {
  /**
   * A repartição do mês, medida no servidor sobre TODAS as parcelas do recorte
   * (e não sobre a página aberta de alguma fábrica).
   */
  split: OfficeSplit;
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
export function OfficeSplitPanel({ split, month, sellerName }: Props) {
  // Mês sem nenhuma comissão do escritório: três zeros não dizem nada.
  if (split.count === 0) return null;

  // Taxa nula no vínculo = o vendedor leva a comissão inteira, que é o padrão
  // de quem nunca definiu a divisão. Sem dizer isso, a linha parece anunciar um
  // mês em que o escritório não ganhou nada.
  const semDivisao = split.office === 0 && split.company !== 0;

  // Sem divisão definida, o número que importa não é a sobra (zero), é o que
  // falta configurar: vira um aviso com o caminho, e não um parêntese longo em
  // letra pequena no fim de uma faixa cinza (crítica de /commissions,
  // 23/11/2026).
  if (semDivisao) {
    return (
      <Alert.Root variant="warning">
        <Alert.Icon icon={Building2} />
        <Alert.Content>
          <Alert.Title>
            Nada fica com o escritório em {monthLabel(month)}
          </Alert.Title>
          <Alert.Description>
            {sellerName ?? "Os vendedores"} {sellerName ? "leva" : "levam"} a
            comissão inteira das fábricas ({formatMoney(split.company)}), porque
            a parte do vendedor não foi definida. Abra a fábrica, vá na aba
            Vendedores e defina a taxa de cada um.
          </Alert.Description>
          <div className="pt-4">
            <TextLink href="/factories">Ir para Fábricas</TextLink>
          </div>
        </Alert.Content>
      </Alert.Root>
    );
  }

  // Uma linha só, com o número da pergunta ("quanto fica comigo?") à frente;
  // de onde ele sai (das fábricas, menos o repasse) vem depois, em cinza.
  return (
    <Card.Root inset tone="muted">
      <Card.Body
        padding="sm"
        className="flex-row flex-wrap items-center gap-x-8 gap-y-4"
      >
        <Building2 size={ICON_SIZE.sm} className="shrink-0 text-(--fg-muted)" />
        <Title variant="body-sm" color="muted">
          Fica no escritório em {monthLabel(month)}
          {sellerName ? ` com ${sellerName}` : ""}:
        </Title>
        <Title variant="body-sm" weight="semibold" color="green">
          {formatMoney(split.office)} ({formatPercent(split.margin)})
        </Title>
        <Title variant="body-sm" color="muted">
          · {formatMoney(split.company)} das fábricas menos{" "}
          {formatMoney(split.seller)} de repasse
        </Title>
      </Card.Body>
    </Card.Root>
  );
}
