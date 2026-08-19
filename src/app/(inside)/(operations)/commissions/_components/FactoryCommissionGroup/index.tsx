"use client";

import { Badge } from "@/components/Badges";
import { Table, TableSort } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CommissionTab,
  factoryHighlights,
  FactoryGroup,
  monthLabel,
  summarizeRows,
  YearMonth,
} from "../../utils";
import { CommissionsTable } from "../CommissionsTable";
import { MarkReceivedModal } from "../MarkReceivedModal";

/** Nada marcado neste cartão: um Set só, para não recriar um por render. */
const EMPTY_SELECTION: Set<string> = new Set();

interface Props {
  /** Linhas da fábrica já recortadas pelos filtros da tela (mês e situação). */
  group: FactoryGroup;
  /** Mês escolhido lá em cima — aqui só rotula o que já veio filtrado. */
  month: YearMonth;
  /** Situação escolhida lá em cima — decide quais valores o cabeçalho destaca. */
  tab: CommissionTab;
  defaultOpen?: boolean;
  /** Gestor (admin/owner): mostra conferência e repasse. Vendedor: só visualiza. */
  canManage: boolean;
  /**
   * Ordenação da tela, publicada para os cabeçalhos desta tabela. É a MESMA de
   * todos os cartões: escolhida uma vez, as fábricas ficam comparáveis entre si.
   */
  sort: TableSort;
  /**
   * Parcelas marcadas NESTA fábrica, ou `undefined` quando a seleção viva é de
   * outro cartão. A seleção mora na página — ver `useScopedSelection`.
   */
  selectedIds?: Set<string>;
  onToggleRow?: (installmentId: string) => void;
  onToggleAll?: (installmentIds: string[]) => void;
  onChanged: () => void;
}

/**
 * Um cartão recolhível por fábrica trabalhada — é assim que a fábrica manda a
 * planilha de repasse, então o de-para fica direto. O cabeçalho resume o que
 * importa no mês (a receber, recebido, quantas conferidas) e "Receber tudo
 * desta fábrica" repassa de uma vez as parcelas a receber.
 *
 * O mês vem pronto do filtro da página: o cartão não escolhe o seu. Antes cada
 * um tinha o próprio seletor, e a tela acabava mostrando fábricas em meses
 * diferentes enquanto o topo somava outro.
 *
 * A seleção também vem de fora, e continua sendo POR FÁBRICA: a conferência
 * acontece contra a planilha de uma fábrica por vez, e um lote que misturasse
 * fábricas seria marcado com a data de repasse errada.
 */
export function FactoryCommissionGroup({
  group,
  month,
  tab,
  defaultOpen = false,
  canManage,
  sort,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onChanged,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const selectedCount = selectedIds?.size ?? 0;

  // Marcar linha num cartão fechado é impossível, mas a seleção pode sobreviver
  // a um "recolher" — reabrir o cartão é o que devolve o contexto do lote.
  useEffect(() => {
    if (selectedCount > 0) setOpen(true);
  }, [selectedCount]);

  const summary = useMemo(() => summarizeRows(group.rows), [group.rows]);
  const highlights = useMemo(
    () => factoryHighlights(summary, tab),
    [summary, tab]
  );

  const total = group.rows.length;
  const allReconciled = total > 0 && summary.reconciledCount === total;

  return (
    <Table.Root sort={sort}>
      <div className="flex flex-wrap items-center gap-16 p-16">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-12 text-left"
        >
          <ChevronDown
            size={20}
            className={`text-(--fg-muted) transition-transform ${
              open ? "" : "-rotate-90"
            }`}
          />
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-8">
              <Title variant="heading-sm">{group.name}</Title>
              {/* Eco da seleção no TOPO: quem marca a primeira linha está aqui
                  em cima, e a barra de atalhos aparece na base da janela. */}
              {selectedCount > 0 && (
                <Badge.Root color="amber" appearance="tinted">
                  <Badge.Text>{selectedCount} selecionada(s)</Badge.Text>
                </Badge.Root>
              )}
            </div>
            <Title
              variant="caption"
              color={canManage && allReconciled ? "green" : "muted"}
            >
              {canManage
                ? `${summary.reconciledCount} de ${total} parcela(s) conferida(s) em ${monthLabel(month)}`
                : `${total} parcela(s) em ${monthLabel(month)}`}
            </Title>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-16">
          {highlights.map((highlight) => (
            <div key={highlight.label} className="flex flex-col items-end">
              <Title variant="caption" color="muted">
                {highlight.label}
              </Title>
              <Title
                variant="body-sm"
                color={highlight.color}
                weight="semibold"
              >
                {formatMoney(highlight.value)}
              </Title>
            </div>
          ))}
          {canManage && summary.receivableIds.length > 0 && (
            <MarkReceivedModal
              installmentIds={summary.receivableIds}
              label={`Receber tudo desta fábrica (${summary.receivableIds.length})`}
              onSuccess={onChanged}
            />
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-(--border)">
          <CommissionsTable
            rows={group.rows}
            loading={false}
            canManage={canManage}
            selectedIds={selectedIds ?? EMPTY_SELECTION}
            onToggleRow={onToggleRow}
            onToggleAll={
              onToggleAll
                ? () => onToggleAll(group.rows.map((row) => row.installmentId))
                : undefined
            }
            onChanged={onChanged}
          />
        </div>
      )}
    </Table.Root>
  );
}
