"use client";

import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { getTodayIso } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  addMonths,
  FactoryGroup,
  isInMonth,
  latestMonthWithData,
  monthLabel,
  summarizeRows,
  yearMonthFromIso,
} from "../../utils";
import { CommissionsTable } from "../CommissionsTable";
import { MarkReceivedModal } from "../MarkReceivedModal";

interface Props {
  group: FactoryGroup;
  defaultOpen?: boolean;
  onChanged: () => void;
}

/**
 * Um cartão recolhível por fábrica trabalhada. Como a planilha de repasse é
 * MENSAL e cada fábrica manda a sua num dia diferente, cada card tem o próprio
 * seletor de mês (pela data em que a comissão cai, `receiveDate`) e abre já no
 * mês da planilha mais recente. O cabeçalho resume o que importa no de-para
 * daquele mês (a receber, recebido, quantas conferidas) e "Receber tudo desta
 * fábrica" repassa de uma vez as parcelas a receber do mês.
 */
export function FactoryCommissionGroup({
  group,
  defaultOpen = false,
  onChanged,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [month, setMonth] = useState(
    () => latestMonthWithData(group.rows) ?? yearMonthFromIso(getTodayIso())
  );

  const monthRows = useMemo(
    () => group.rows.filter((row) => isInMonth(row.receiveDate, month)),
    [group.rows, month]
  );
  const summary = useMemo(() => summarizeRows(monthRows), [monthRows]);

  const total = monthRows.length;
  const allReconciled = total > 0 && summary.reconciledCount === total;
  const isCurrentMonth = useMemo(() => {
    const now = yearMonthFromIso(getTodayIso());
    return now.year === month.year && now.month === month.month;
  }, [month]);

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
            <Title variant="caption" color={allReconciled ? "green" : "muted"}>
              {summary.reconciledCount} de {total} parcela(s) conferida(s) em{" "}
              {monthLabel(month)}
            </Title>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-16">
          {/* Mês da planilha desta fábrica: anterior + atual + próximo. */}
          <div className="flex items-center gap-4">
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
              isIconOnly
              aria-label="Mês anterior"
              title="Mês anterior"
              onClick={() => setMonth((m) => addMonths(m, -1))}
            >
              <Button.Icon icon={ChevronLeft} />
            </Button.Root>
            <Button.Root
              appearance={isCurrentMonth ? "tinted" : "ghost"}
              color={isCurrentMonth ? "amber" : "neutral"}
              size="sm"
              noUppercase
              onClick={() => setMonth(yearMonthFromIso(getTodayIso()))}
            >
              <Button.Icon icon={CalendarDays} />
              <Button.Title>{monthLabel(month)}</Button.Title>
            </Button.Root>
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
              isIconOnly
              aria-label="Próximo mês"
              title="Próximo mês"
              onClick={() => setMonth((m) => addMonths(m, 1))}
            >
              <Button.Icon icon={ChevronRight} />
            </Button.Root>
          </div>

          <div className="flex flex-col items-end">
            <Title variant="caption" color="muted">
              A receber
            </Title>
            <Title variant="body-sm" color="amber" weight="semibold">
              {formatMoney(summary.receivable)}
            </Title>
          </div>
          <div className="flex flex-col items-end">
            <Title variant="caption" color="muted">
              Recebido
            </Title>
            <Title variant="body-sm" color="green" weight="semibold">
              {formatMoney(summary.received)}
            </Title>
          </div>
          {summary.receivableIds.length > 0 && (
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
          {total === 0 ? (
            <div className="p-24 text-center">
              <Title variant="body-sm" color="muted">
                Nenhuma comissão desta fábrica em {monthLabel(month)}. Use as
                setas para conferir outro mês.
              </Title>
            </div>
          ) : (
            <CommissionsTable
              rows={monthRows}
              loading={false}
              onChanged={onChanged}
            />
          )}
        </div>
      )}
    </Table.Root>
  );
}
