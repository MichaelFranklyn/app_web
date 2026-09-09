"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { clientName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Coins } from "lucide-react";
import Link from "next/link";
import { CommissionRow } from "../../interface";
import {
  COMMISSION_STATUS_LABEL,
  COMMISSION_STATUS_TONE,
  type CommissionLens,
  OFFICE_LENS,
} from "../../utils";
import { ReconcileToggle } from "../ReconcileToggle";
import { CommissionRowActions } from "./CommissionRowActions";
import { InstallmentStateCell } from "./InstallmentStateCell";

interface Props {
  rows: CommissionRow[];
  loading: boolean;
  /** Gestor vê as colunas de conferência e repasse; vendedor só visualiza. */
  canManage: boolean;
  /**
   * De quem é o dinheiro das colunas "Quando", "Comissão" e "Situação". As
   * demais (cliente, pedido, nota, boleto) são da parcela e não mudam de ótica.
   */
  lens?: CommissionLens;
  /**
   * Mostra de QUEM é a parcela.
   *
   * Só quando a tela soma todos os vendedores (ótica do escritório): ali as
   * linhas de várias pessoas se misturam dentro do mesmo cartão de fábrica, e
   * sem esta coluna não há como saber a quem uma parcela pertence. Recortada por
   * um vendedor, ela repetiria o mesmo nome em todas as linhas.
   */
  showSeller?: boolean;
  /** Parcelas marcadas para as ações em lote (só gestão). */
  selectedIds?: Set<string>;
  onToggleRow?: (installmentId: string) => void;
  onToggleAll?: () => void;
  onChanged: () => void;
}

/** Quando a comissão cai (ou caiu), na linguagem de cada situação. */
const whenLabel = (row: CommissionRow, lens: CommissionLens): string => {
  const status = lens.status(row);
  const date = lens.receiveDate(row);
  if (status === "received")
    return `Recebido em ${formatDateDMY(date ?? undefined)}`;
  if (status === "receivable")
    return `Receber em ${formatDateDMY(date ?? undefined)}`;
  if (status === "chargeback")
    return date ? `Desconto em ${formatDateDMY(date)}` : "Desconto a agendar";
  if (status === "pending")
    return date ? `Previsto p/ ${formatDateDMY(date)}` : "Aguardando pagamento";
  return "—";
};

export function CommissionsTable({
  rows,
  loading,
  canManage,
  lens = OFFICE_LENS,
  showSeller = false,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onChanged,
}: Props) {
  const selectable = canManage && !!onToggleRow;
  // Seleção + boleto + conferência/repasse: as colunas de gestão.
  const columns =
    8 + (showSeller ? 1 : 0) + (selectable ? 1 : 0) + (canManage ? 2 : 0);
  const allSelected =
    rows.length > 0 && rows.every((row) => selectedIds?.has(row.installmentId));

  return (
    <Table.Table>
      <Table.Header>
        <Table.Row>
          {selectable && (
            <Table.Head>
              {/* `label` no checkbox vira texto visível; o nome acessível vai
                  no `aria-label` — sem ele o leitor de tela anuncia "caixa de
                  seleção" e nada mais. */}
              <Input.Checkbox
                label=""
                aria-label="Selecionar todas as parcelas desta fábrica"
                checked={allSelected}
                onChange={() => onToggleAll?.()}
              />
            </Table.Head>
          )}
          {/* A explicação de cada coluna vai no `title` do cabeçalho (tooltip
              do próprio navegador) e não num HelpTooltip: cabeçalho ordenável já
              É um botão, e um botão de ajuda dentro dele seria HTML inválido. */}
          <Table.Head sortKey="client" title="Cliente que comprou o pedido.">
            Cliente
          </Table.Head>
          {/* As duas colunas de "quem" ficam juntas, antes do bloco que
              identifica o documento (pedido, nota, parcela). */}
          {showSeller && (
            <Table.Head
              sortKey="seller"
              title="Vendedor que fez o pedido. A coluna aparece porque a tela está somando todos os vendedores; para ver um de cada vez, troque “Valores de” para Vendedor lá em cima — ou use o filtro Vendedor."
            >
              Vendedor
            </Table.Head>
          )}
          <Table.Head
            sortKey="order"
            title="Código curto do pedido. Clique para abrir o pedido inteiro."
          >
            Pedido
          </Table.Head>
          {/* A planilha da fábrica vem pela NOTA, não pelo pedido: sem esta
              coluna, casar o repasse com a parcela é feito no olho. */}
          <Table.Head
            sortKey="invoiceNumber"
            title="Número da nota que a fábrica emitiu — é por ele que a planilha da fábrica é conferida. “Sem nota” significa que ainda não foi informada: dá para preencher em “Editar faturamento”, dentro do pedido."
          >
            Nota fiscal
          </Table.Head>
          <Table.Head
            sortKey="sequence"
            title="Número da parcela do pedido: 1 de 3, 2 de 3…"
          >
            Parcela
          </Table.Head>
          {/* Data e dinheiro abrem na ordem útil: o mais recente e o maior. */}
          <Table.Head
            sortKey="dueDate"
            sortFirst="desc"
            title="Situação do boleto do CLIENTE (a vencer, vencido, pago, não pagou). É outra coisa que a situação da comissão: boleto vencido pode ter comissão a receber."
          >
            Boleto
          </Table.Head>
          <Table.Head
            sortKey="receiveDate"
            sortFirst="desc"
            title={
              lens.audience === "seller"
                ? "Data em que o escritório repassa a comissão ao vendedor — o ciclo dele, que costuma ser diferente do da fábrica. É por esta data que o mês lá em cima recorta a tela."
                : "Data em que a comissão cai (ou caiu). É por esta data que o mês lá em cima recorta a tela."
            }
          >
            Quando
          </Table.Head>
          <Table.Head
            sortKey="amount"
            sortFirst="desc"
            align="right"
            title={
              lens.audience === "seller"
                ? "A fatia do vendedor nesta parcela — o que o escritório repassa a ele. Estorno aparece em vermelho e com sinal negativo: é comissão que volta."
                : "Valor da comissão que a fábrica paga ao escritório nesta parcela. Estorno aparece em vermelho e com sinal negativo: é comissão que volta."
            }
          >
            Comissão
          </Table.Head>
          <Table.Head
            sortKey="status"
            title={
              lens.audience === "seller"
                ? "Situação da comissão DO VENDEDOR: prevista, a receber, repassada, estorno ou devolução. Ela não acompanha a da fábrica — o escritório pode já ter recebido e ainda não ter repassado."
                : "Situação da COMISSÃO: prevista, a receber, recebida, estorno ou devolução."
            }
          >
            Situação
          </Table.Head>
          {canManage && (
            <Table.Head
              sortKey="reconciled"
              title="Marque quando esta parcela bater com a planilha que a fábrica mandou. A marca fica salva para a conferência não recomeçar do zero."
            >
              Conferência
            </Table.Head>
          )}
          {canManage && (
            <Table.Head
              className="text-right"
              title="Ações da parcela: registrar o recebimento da comissão, baixar o boleto, marcar calote e desfazer."
            >
              Ação
            </Table.Head>
          )}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {loading ? (
          <Table.Skeleton columns={columns} rows={6} />
        ) : rows.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={columns}>
              <EmptyState.Root>
                <EmptyState.Icon>
                  <Coins size={32} />
                </EmptyState.Icon>
                <EmptyState.Title>Nenhuma comissão aqui</EmptyState.Title>
                <EmptyState.Description>
                  As comissões aparecem quando os pedidos são faturados. Fature
                  um pedido para gerar as parcelas e acompanhar o que há a
                  receber.
                </EmptyState.Description>
              </EmptyState.Root>
            </Table.Cell>
          </Table.Row>
        ) : (
          rows.map((row) => (
            <Table.Row key={row.installmentId}>
              {selectable && (
                <Table.Cell>
                  <Input.Checkbox
                    label=""
                    aria-label={`Selecionar a parcela ${row.sequence} de ${clientName(row.client)}`}
                    checked={selectedIds?.has(row.installmentId) ?? false}
                    onChange={() => onToggleRow?.(row.installmentId)}
                  />
                </Table.Cell>
              )}
              <Table.Cell variant="strong">{clientName(row.client)}</Table.Cell>
              {showSeller && (
                <Table.Cell>
                  {row.seller?.name ?? (
                    <Title variant="body-sm" color="muted">
                      —
                    </Title>
                  )}
                </Table.Cell>
              )}
              <Table.Cell>
                <Link
                  href={`/orders/${row.orderId}`}
                  className="text-(--amber) hover:underline"
                >
                  {row.orderId.slice(0, 8).toUpperCase()}
                </Link>
              </Table.Cell>
              <Table.Cell>
                {row.invoiceNumber ? (
                  row.invoiceNumber
                ) : (
                  <Title variant="body-sm" color="muted">
                    Sem nota
                  </Title>
                )}
              </Table.Cell>
              <Table.Cell>{row.sequence}</Table.Cell>
              <Table.Cell>
                <InstallmentStateCell row={row} />
              </Table.Cell>
              <Table.Cell>{whenLabel(row, lens)}</Table.Cell>
              <Table.Cell className="text-right">
                {/* Estorno vem negativo: sai em vermelho para não ser lido como ganho. */}
                <Title
                  variant="body-sm"
                  color={lens.status(row) === "chargeback" ? "red" : undefined}
                  weight={
                    lens.status(row) === "chargeback" ? "bold" : undefined
                  }
                >
                  {formatMoney(lens.amount(row))}
                </Title>
              </Table.Cell>
              <Table.Cell>
                <Badge.Root
                  color={COMMISSION_STATUS_TONE[lens.status(row)]}
                  appearance="tinted"
                >
                  <Badge.Text>
                    {COMMISSION_STATUS_LABEL[lens.status(row)]}
                  </Badge.Text>
                </Badge.Root>
              </Table.Cell>
              {canManage && (
                <Table.Cell>
                  <ReconcileToggle
                    installmentId={row.installmentId}
                    reconciled={row.isReconciled}
                    onChanged={onChanged}
                    locked={row.status === "received"}
                  />
                </Table.Cell>
              )}
              {canManage && (
                <Table.Cell>
                  <div className="flex items-center justify-end">
                    <CommissionRowActions row={row} onChanged={onChanged} />
                  </div>
                </Table.Cell>
              )}
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table.Table>
  );
}
