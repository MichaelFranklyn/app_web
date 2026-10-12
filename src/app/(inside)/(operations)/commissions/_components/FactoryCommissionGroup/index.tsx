"use client";
import { Divider } from "@/components/Divider";
import { Collapse } from "@/components/Collapse";

import { Badge } from "@/components/Badges";
import { Emphasis } from "@/components/Emphasis";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { QueryError } from "@/components/QueryError";
import { Table, TableSort } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { useEffect, useMemo, useState } from "react";
import {
  CommissionFactoryRowsData,
  CommissionMonthInput,
  CommissionRow,
} from "../../interface";
import { useFactoryRows } from "../../useFactoryRows";
import {
  type CommissionLens,
  CommissionTab,
  factoryHighlights,
  FactoryGroup,
  monthLabel,
  OFFICE_LENS,
  YearMonth,
} from "../../utils";
import { ignoresMonth } from "../../help";
import { CommissionsTable } from "../CommissionsTable";
import { MarkReceivedModal } from "../MarkReceivedModal";

/** Nada marcado neste cartão: um Set só, para não recriar um por render. */
const EMPTY_SELECTION: Set<string> = new Set();

interface Props {
  /**
   * O resumo da fábrica no recorte da tela (mês, situação, filtros), somado no
   * servidor sobre TODAS as parcelas dela — não só as da página aberta.
   */
  group: FactoryGroup;
  /** O recorte da tela: é com ele que o cartão pede as suas linhas. */
  input: CommissionMonthInput;
  /** A primeira página, quando já veio junto do resumo (o cartão que abre só). */
  firstPage?: CommissionFactoryRowsData;
  /** Mês escolhido lá em cima — aqui só rotula o que já veio filtrado. */
  month: YearMonth;
  /** Situação escolhida lá em cima — decide quais valores o cabeçalho destaca. */
  tab: CommissionTab;
  defaultOpen?: boolean;
  /** Gestor (admin/owner): mostra conferência e repasse. Vendedor: só visualiza. */
  canManage: boolean;
  /** De quem é o dinheiro que o cartão destaca e a tabela imprime. */
  lens?: CommissionLens;
  /**
   * Mostra a coluna "Vendedor" na tabela: as linhas de várias pessoas se
   * misturam dentro do cartão quando a tela soma a empresa inteira.
   */
  showSeller?: boolean;
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
  /** Marca (ou desmarca) as parcelas da PÁGINA aberta, sem largar as outras. */
  onTogglePage?: (installmentIds: string[]) => void;
  /** Entrega à seleção o conteúdo das linhas exibidas (ver `useCommissionsSelection`). */
  onRowsLoaded?: (factoryId: string, rows: CommissionRow[]) => void;
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
 *
 * As LINHAS são do cartão: ele as pede ao servidor quando é aberto, uma página
 * por vez, já filtradas e ordenadas. Os números do cabeçalho e o lote do
 * "Receber tudo" não dependem da página — vêm do resumo da fábrica inteira.
 */
export function FactoryCommissionGroup({
  group,
  input,
  firstPage,
  month,
  tab,
  defaultOpen = false,
  canManage,
  lens = OFFICE_LENS,
  showSeller = false,
  sort,
  selectedIds,
  onToggleRow,
  onTogglePage,
  onRowsLoaded,
  onChanged,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const selectedCount = selectedIds?.size ?? 0;

  // Marcar linha num cartão fechado é impossível, mas a seleção pode sobreviver
  // a um "recolher" — reabrir o cartão é o que devolve o contexto do lote.
  useEffect(() => {
    if (selectedCount > 0) setOpen(true);
  }, [selectedCount]);

  const { summary } = group;
  const highlights = useMemo(
    () => factoryHighlights(summary, tab),
    [summary, tab]
  );

  const list = useFactoryRows({
    input,
    factoryId: group.factoryId,
    enabled: open,
    seed: firstPage,
  });
  const { rows } = list;
  useEffect(() => {
    if (rows) onRowsLoaded?.(group.factoryId, rows);
  }, [rows, onRowsLoaded, group.factoryId]);

  // Com a fábrica em mais de uma página, a caixa do cabeçalho marca só a
  // página aberta — e a seleção acumula entre elas. As duas coisas ficam
  // escritas acima da tabela: quem marca precisa saber até onde o lote vai.
  const isPaged = list.totalPages > 1;
  const selectedOnPage = rows
    ? rows.filter((row) => selectedIds?.has(row.installmentId)).length
    : 0;
  const selectedElsewhere = selectedCount - selectedOnPage;

  const total = group.count;
  const allReconciled = total > 0 && summary.reconciledCount === total;
  // A aba "Boleto em atraso" traz todos os vencimentos: dizer "em agosto" aqui
  // seria o rótulo contradizendo as linhas logo abaixo dele.
  const scopeLabel = ignoresMonth(tab)
    ? "de todos os vencimentos"
    : `em ${monthLabel(month)}`;

  return (
    <Table.Root sort={sort}>
      <div className="flex flex-wrap items-center gap-16 p-16">
        <Collapse.Trigger
          open={open}
          onToggle={() => setOpen((v) => !v)}
          className="flex-1"
        >
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
                ? `${summary.reconciledCount} de ${total} parcela(s) conferida(s) ${scopeLabel}`
                : `${total} parcela(s) ${scopeLabel}`}
            </Title>
          </div>
        </Collapse.Trigger>

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
          {/* "Receber tudo" marca que a FÁBRICA pagou — é sempre o nível do
              escritório. Na ótica do vendedor ele ficaria ao lado de valores
              que não são os que o botão movimenta; a ação continua disponível
              trocando a ótica lá em cima (e uma a uma, na linha). */}
          {canManage &&
            lens.audience === "office" &&
            summary.receivableIds.length > 0 && (
              <MarkReceivedModal
                installmentIds={summary.receivableIds}
                label={`Receber tudo desta fábrica (${summary.receivableIds.length})`}
                onSuccess={onChanged}
              />
            )}
        </div>
      </div>

      {open && (
        <div>
          <Divider.Root />
          {isPaged && onTogglePage && (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 px-16 pt-12">
              <Title variant="caption" color="muted">
                A caixa do cabeçalho marca <Emphasis>esta página</Emphasis> (
                {rows?.length ?? 0} de {total} parcelas). Para marcar outras,
                troque de página — o que já foi marcado continua marcado.
              </Title>
              {selectedCount > 0 && (
                <Title variant="caption" color="amber" weight="semibold">
                  {selectedCount} selecionada(s) nesta fábrica
                  {selectedElsewhere > 0
                    ? ` — ${selectedOnPage} nesta página e ${selectedElsewhere} em outra(s)`
                    : ""}
                </Title>
              )}
            </div>
          )}
          {list.hasFailed ? (
            <div className="p-16">
              <QueryError onRetry={list.retry} />
            </div>
          ) : (
            <CommissionsTable
              rows={rows ?? []}
              loading={list.showSkeleton}
              canManage={canManage}
              lens={lens}
              showSeller={showSeller}
              isPaged={isPaged}
              selectedIds={selectedIds ?? EMPTY_SELECTION}
              onToggleRow={onToggleRow}
              onToggleAll={
                onTogglePage && rows
                  ? () => onTogglePage(rows.map((row) => row.installmentId))
                  : undefined
              }
              onChanged={onChanged}
            />
          )}

          {/* Só quando a fábrica não cabe numa página: num mês comum o rodapé
              seria uma linha a mais dizendo "página 1 de 1". */}
          {list.totalPages > 1 && (
            <Table.Footer>
              <Table.Footer.Info>
                {list.isRefreshing && (
                  <Loading.Spinner size="sm" className="mr-6 inline-block" />
                )}
                {/* Os números lá em cima são da fábrica INTEIRA; a marcação em
                    lote, da página — as duas coisas ditas, para o lote não
                    parecer maior (nem menor) do que é. */}
                {`${total} parcelas · página ${list.page} de ${list.totalPages} · os valores do cartão somam todas as páginas`}
              </Table.Footer.Info>
              <Pagination.Smart
                currentPage={list.page}
                totalPages={list.totalPages}
                onPageChange={list.setPage}
              />
            </Table.Footer>
          )}
        </div>
      )}
    </Table.Root>
  );
}
