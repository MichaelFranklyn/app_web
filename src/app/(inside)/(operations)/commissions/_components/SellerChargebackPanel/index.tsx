"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useLocalTable } from "@/hooks/useLocalTable";
import { clientName, factoryName } from "@/utils/company";
import { CalendarClock, Check, HandCoins, Undo2 } from "lucide-react";
import { useMemo } from "react";

import { CHARGEBACK_PANEL_HELP } from "../../help";
import { CommissionRow } from "../../interface";
import { monthLabel, YearMonth } from "../../utils";
import { ChargebackSection, SectionAction } from "./ChargebackSection";
import { useChargebackActions } from "./useChargebackActions";

interface Props {
  /** TODAS as linhas do vendedor — a fila não é recortada por mês. */
  rows: CommissionRow[];
  /** Mês aberto no navegador da página: é nele que o desconto é agendado. */
  month: YearMonth;
  /** Falso para o vendedor: ele acompanha, quem decide é o escritório. */
  canManage: boolean;
  onChanged: () => void;
}

/**
 * A vida do estorno na comissão do vendedor, do calote à devolução.
 *
 * São quatro momentos, e cada um pede uma coisa diferente de quem olha: o que
 * ainda vai ser descontado (e quando), o que já saiu, e o que precisa voltar
 * porque o cliente acabou pagando. Ficam todos aqui, um abaixo do outro, porque
 * é a mesma pergunta do vendedor: "o que aconteceu com a minha comissão?".
 *
 * O vendedor vê a mesma coisa sem os botões. Antes disto ele não via nada — o
 * estorno sem mês definido não caía em fechamento nenhum, e a primeira notícia
 * era o dinheiro a menos.
 */
/**
 * As colunas ordenáveis das quatro seções.
 *
 * As chaves levam o prefixo `cb` porque a ordenação mora na URL e é uma só na
 * tela: sem o prefixo, ordenar aqui por "cliente" acenderia também a coluna
 * "Cliente" dos cartões de fábrica, que compara outra coisa.
 */
const CHARGEBACK_COLUMNS = {
  cbClient: (row: CommissionRow) => clientName(row.client),
  cbFactory: (row: CommissionRow) => factoryName(row.factory),
  cbAmount: (row: CommissionRow) => Number(row.sellerAmount),
  // A coluna mostra o mês em que o desconto saiu ou vai sair — o que já saiu
  // tem data própria e é por ela que ele se ordena.
  cbMonth: (row: CommissionRow) =>
    row.sellerChargebackSettledAt ?? row.sellerChargebackMonth,
};

export function SellerChargebackPanel({
  rows,
  month,
  canManage,
  onChanged,
}: Props) {
  const { scheduleTo, markSettled, markRefunded, isLoading } =
    useChargebackActions(onChanged);

  // Ordena ANTES de separar as seções: a comparação é a mesma nas quatro, e
  // separar depois preserva a ordem escolhida em cada uma.
  const table = useLocalTable<CommissionRow>({
    items: rows,
    columns: CHARGEBACK_COLUMNS,
  });
  const sortedRows = table.displayedData;

  const grupos = useMemo(() => {
    const chargebacks = sortedRows.filter(
      (row) => row.sellerStatus === "chargeback"
    );
    return {
      fila: chargebacks.filter((row) => row.sellerChargebackMonth === null),
      agendados: chargebacks.filter(
        (row) => row.sellerChargebackMonth !== null
      ),
      descontados: sortedRows.filter(
        (row) => row.sellerStatus === "chargeback_settled"
      ),
      devolucoes: sortedRows.filter((row) => row.sellerStatus === "refund"),
    };
  }, [sortedRows]);

  const vazio =
    grupos.fila.length === 0 &&
    grupos.agendados.length === 0 &&
    grupos.descontados.length === 0 &&
    grupos.devolucoes.length === 0;
  if (vazio) return null;

  const acoes = (lista: SectionAction[]) => (canManage ? lista : []);

  return (
    <Table.Root sort={table.sort}>
      <div className="flex flex-col gap-2 p-16">
        <div className="flex items-center gap-4">
          <Title variant="heading-sm">Estornos na comissão do vendedor</Title>
          <HelpTooltip
            label="Sobre os estornos do vendedor"
            position="right"
            content={CHARGEBACK_PANEL_HELP}
          />
        </div>
        <Title variant="caption" color="muted">
          {canManage
            ? "Comissão já repassada de boletos que o cliente não pagou. Enquanto você não escolher o mês, o valor continua na fila."
            : "Boletos que o cliente não pagou depois de a comissão já ter sido repassada. O escritório define em qual mês o valor sai."}
        </Title>
        {/* O recorte da tela não vale aqui, e isso precisa estar ESCRITO: quem
            vê quatro linhas num mês que "só tem uma" acha que a conta furou. */}
        <Title variant="caption" color="muted">
          Esta lista mostra os estornos de todos os meses — ela não segue o mês
          nem a aba escolhidos acima.
        </Title>
      </div>

      <ChargebackSection
        title="A descontar"
        hint={
          canManage
            ? "Ainda sem mês definido — pode segurar quanto for preciso."
            : "O escritório ainda não definiu o mês do desconto."
        }
        rows={grupos.fila}
        tone="red"
        isLoading={isLoading}
        actions={acoes([
          {
            label: `Descontar em ${monthLabel(month)}`,
            bulkLabel: `Descontar tudo em ${monthLabel(month)}`,
            icon: CalendarClock,
            color: "red",
            onRun: (ids) => scheduleTo(ids, month),
          },
        ])}
      />

      <ChargebackSection
        title="Agendado"
        hint={
          canManage
            ? "Sai no fechamento do mês marcado. Registre o desconto quando ele acontecer."
            : "Vai sair no fechamento do mês marcado."
        }
        rows={grupos.agendados}
        tone="red"
        isLoading={isLoading}
        actions={acoes([
          {
            label: "Descontei",
            bulkLabel: "Registrar todos como descontados",
            icon: Check,
            color: "red",
            onRun: markSettled,
          },
          {
            label: "Voltar para a fila",
            icon: Undo2,
            color: "neutral",
            onRun: (ids) => scheduleTo(ids, null),
          },
        ])}
      />

      <ChargebackSection
        title="A devolver"
        hint={
          canManage
            ? "O cliente pagou depois do desconto: o valor volta para o vendedor."
            : "O cliente pagou depois do desconto — este valor volta para você."
        }
        rows={grupos.devolucoes}
        tone="green"
        isLoading={isLoading}
        actions={acoes([
          {
            label: "Devolvi",
            bulkLabel: "Registrar todas as devoluções",
            icon: HandCoins,
            color: "green",
            onRun: markRefunded,
          },
        ])}
      />

      <ChargebackSection
        title="Já descontado"
        hint="Histórico: saíram do fechamento do mês indicado e não pesam mais."
        rows={grupos.descontados}
        tone="neutral"
      />
    </Table.Root>
  );
}
