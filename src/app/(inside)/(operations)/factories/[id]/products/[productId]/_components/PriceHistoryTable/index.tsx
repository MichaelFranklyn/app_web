"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatAmount, formatDateDMY } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { ChevronDown, History } from "lucide-react";
import { useState } from "react";

import { PRODUCT_PRICE_HISTORY_QUERY, ProductPriceHistoryData } from "./gql";
import { VariationBadge } from "./VariationBadge";

interface Props {
  productId: string;
  /** Unidades por embalagem: o preço da tabela é da embalagem fechada. */
  unitPerPack: number;
  baseUnitLabel: string | null;
}

/** Quantas mudanças aparecem antes do "Mostrar mais". */
const PAGE = 10;

/**
 * Cada vez que o preço de tabela do produto mudou, da mais nova à mais
 * antiga, com a variação sobre o preço anterior do MESMO nível e região. A
 * tabela nova que só repete o preço não aparece — a pergunta é "quando subiu".
 */
export function PriceHistoryTable({
  productId,
  unitPerPack,
  baseUnitLabel,
}: Props) {
  const [shown, setShown] = useState(PAGE);
  const { data, loading, error, refetch } = useQuery<ProductPriceHistoryData>(
    PRODUCT_PRICE_HISTORY_QUERY,
    { variables: { productId }, skip: !productId }
  );
  const changes = data?.productPriceHistory ?? [];
  const visible = changes.slice(0, shown);

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Histórico de preços
          <HelpTooltip
            label="De onde vem o histórico?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="body-sm">
                  Toda vez que o preço do produto muda numa tabela — importação
                  de tabela nova, edição ou cópia —, a mudança fica guardada
                  aqui com a variação sobre o preço anterior do mesmo nível.
                </Title>
                <Title variant="body-sm" color="muted">
                  Preço repetido pela tabela nova e promoção relâmpago não
                  contam como mudança. Tabelas excluídas saem do histórico.
                  Edições feitas antes de 18/10/2026 não foram guardadas.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Data</Table.Head>
            <Table.Head>Nível</Table.Head>
            <Table.Head>Tabela</Table.Head>
            <Table.Head>Preço (embalagem)</Table.Head>
            <Table.Head>Variação</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && changes.length === 0 ? (
            <Table.Skeleton columns={5} rows={4} />
          ) : error && changes.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : changes.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <History size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum preço ainda</EmptyState.Title>
                  <EmptyState.Description>
                    O histórico começa quando o produto ganha preço numa tabela.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            visible.map((change) => (
              <Table.Row key={change.id}>
                <Table.Cell variant="dim">
                  {formatDateDMY(change.changedAt)}
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root color="neutral" appearance="tinted">
                    <Badge.Text>{change.tierName}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col">
                    <Table.CellText variant="strong">
                      {change.priceListName}
                    </Table.CellText>
                    <Table.CellText variant="dim2">
                      {[
                        change.region,
                        change.isPriceListActive ? "Ativa" : "Inativa",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Table.CellText>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col">
                    <Table.CellText variant="strong">
                      R$ {formatAmount(change.unitPrice)}
                    </Table.CellText>
                    {change.previousUnitPrice !== null && (
                      <Table.CellText variant="dim2">
                        antes R$ {formatAmount(change.previousUnitPrice)}
                      </Table.CellText>
                    )}
                    {unitPerPack > 1 && baseUnitLabel && (
                      <Table.CellText variant="dim2">
                        R${" "}
                        {formatAmount(Number(change.unitPrice) / unitPerPack)} /{" "}
                        {baseUnitLabel}
                      </Table.CellText>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <VariationBadge variationPct={change.variationPct} />
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>

      {changes.length > shown && (
        <div className="flex justify-center p-12">
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            noUppercase
            onClick={() => setShown((n) => n + PAGE)}
          >
            <Button.Icon icon={ChevronDown} />
            <Button.Title>Mostrar mais ({changes.length - shown})</Button.Title>
          </Button.Root>
        </div>
      )}
    </Table.Root>
  );
}
