"use client";

import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CommissionTab,
  factoryHighlights,
  FactoryGroup,
  monthLabel,
  summarizeRows,
  YearMonth,
} from "../../utils";
import { BulkActionsBar } from "../BulkActionsBar";
import { CommissionsTable } from "../CommissionsTable";
import { MarkReceivedModal } from "../MarkReceivedModal";

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
 */
export function FactoryCommissionGroup({
  group,
  month,
  tab,
  defaultOpen = false,
  canManage,
  onChanged,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  // A seleção é POR FÁBRICA de propósito: a conferência acontece contra a
  // planilha de uma fábrica por vez, e um lote que misturasse fábricas seria
  // marcado com a data de repasse errada.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleRow = (installmentId: string) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(installmentId)) next.delete(installmentId);
      else next.add(installmentId);
      return next;
    });

  const toggleAll = () =>
    setSelectedIds((current) =>
      current.size === group.rows.length
        ? new Set()
        : new Set(group.rows.map((row) => row.installmentId))
    );

  const clearSelection = () => setSelectedIds(new Set());

  const summary = useMemo(() => summarizeRows(group.rows), [group.rows]);
  const highlights = useMemo(
    () => factoryHighlights(summary, tab),
    [summary, tab]
  );

  const total = group.rows.length;
  const allReconciled = total > 0 && summary.reconciledCount === total;

  return (
    <Table.Root>
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
            <Title variant="heading-sm">{group.name}</Title>
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
            selectedIds={canManage ? selectedIds : undefined}
            onToggleRow={canManage ? toggleRow : undefined}
            onToggleAll={canManage ? toggleAll : undefined}
            onChanged={onChanged}
          />
          {canManage && (
            <BulkActionsBar
              selectedIds={Array.from(selectedIds)}
              receivableIds={group.rows
                .filter(
                  (row) =>
                    selectedIds.has(row.installmentId) && row.isReceivable
                )
                .map((row) => row.installmentId)}
              onClear={clearSelection}
              onChanged={onChanged}
            />
          )}
        </div>
      )}
    </Table.Root>
  );
}
