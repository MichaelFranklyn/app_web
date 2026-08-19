"use client";

import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { AlertTriangle } from "lucide-react";

import { DefaultImpact, monthLabel, YearMonth } from "../../utils";

interface Props {
  impact: DefaultImpact;
  month: YearMonth;
}

const percent = (share: number) => `${Math.round(share * 100)}%`;

/**
 * O que o calote vai custar, dito antes de confirmar.
 *
 * O gestor marca "não pagou" lendo o relatório da fábrica, sem saber de cabeça
 * quanto já foi repassado a cada vendedor nem o tamanho do mês deles. Um estorno
 * de seis parcelas pode passar da comissão inteira de um mês fraco — e a hora de
 * descobrir isso é agora, não depois de o vendedor abrir a tela.
 */
export function DefaultImpactNotice({ impact, month }: Props) {
  const semDivida = impact.withoutDebt;
  const temImpacto = impact.factoryChargeback > 0 || impact.sellers.length > 0;

  if (!temImpacto) {
    return (
      <Title variant="body-sm" color="muted">
        Nenhuma dessas comissões foi paga ainda — o calote apenas tira o valor
        do previsto, sem ninguém devolver nada.
      </Title>
    );
  }

  return (
    <div className="rounded-8 flex flex-col gap-12 bg-(--bg3) p-16">
      <Title variant="label">O que volta</Title>

      {impact.factoryChargeback > 0 && (
        <Title variant="body-sm">
          A fábrica desconta <b>{formatMoney(impact.factoryChargeback)}</b> do
          escritório no fechamento seguinte.
        </Title>
      )}

      {impact.sellers.map((seller) => {
        const estoura = seller.share > 0.5;
        return (
          <div key={seller.sellerId} className="flex flex-col gap-2">
            <Title variant="body-sm">
              De <b>{seller.name}</b> há {formatMoney(seller.amount)} a
              recuperar
              {seller.monthCommission > 0 && (
                <>
                  {" "}
                  — {percent(seller.share)} da comissão dele em{" "}
                  {monthLabel(month)}
                </>
              )}
              .
            </Title>
            {estoura && (
              <span className="inline-flex items-center gap-6">
                <AlertTriangle size={14} className="text-(--amber)" />
                <Title variant="caption" color="amber">
                  {seller.share >= 1
                    ? "Passa da comissão inteira do mês dele."
                    : "Come mais da metade do mês dele."}{" "}
                  Depois de confirmar, dá para dividir o desconto em vários
                  meses no painel de estornos.
                </Title>
              </span>
            )}
          </div>
        );
      })}

      {semDivida > 0 && (
        <Title variant="caption" color="muted">
          Outras {semDivida} parcela(s) ainda não tinham comissão paga: nelas o
          calote só cancela o previsto.
        </Title>
      )}
    </div>
  );
}
