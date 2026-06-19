"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatDateDMY } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { Percent } from "lucide-react";
import { AddTaxModal } from "./AddTaxModal";
import { EditTaxModal } from "./EditTaxModal";
import { PRODUCT_TAXES_QUERY } from "./gql";
import { RemoveTaxModal } from "./RemoveTaxModal";

interface ProductTax {
  id: string;
  rate: string;
  updatedAt: string;
  taxRule: {
    id: string;
    name: string;
  };
}

const formatRate = (rate: string): string => `${Number(rate).toFixed(2)}%`;

interface ProductTaxesData {
  product_taxes: {
    edges: { node: ProductTax }[];
    totalCount: number;
  };
}

interface Props {
  productId: string;
  /** Disparado após qualquer mudança de imposto — o preço c/ imposto das tabelas
   * ativas é recalculado no back, então a tabela de preços precisa ressincronizar. */
  onChanged?: () => void;
}

export function TaxesTable({ productId, onChanged }: Props) {
  const { data, loading, refetch } = useQuery<ProductTaxesData>(
    PRODUCT_TAXES_QUERY,
    {
      variables: {
        input: {
          first: 50,
          filters: [{ field: "product_id", operator: "eq", value: productId }],
        },
      },
    }
  );

  const taxes = data?.product_taxes?.edges.map((e) => e.node) ?? [];
  const handleChanged = () => {
    refetch();
    onChanged?.();
  };

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Impostos incidentes
          <HelpTooltip
            label="Como o imposto afeta os preços?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Mudou um imposto?
                </Title>
                <Title variant="body-sm">
                  Adicionar, editar a alíquota ou remover um imposto recalcula
                  automaticamente o &quot;preço c/ imposto&quot; deste produto em
                  todas as tabelas de preço <b>ativas</b>.
                </Title>
                <Title variant="body-sm" color="muted">
                  Tabelas inativas (histórico) mantêm os valores da época, e
                  pedidos já fechados não são afetados.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <AddTaxModal productId={productId} onAdded={handleChanged} />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Imposto</Table.Head>
            <Table.Head>Alíquota</Table.Head>
            <Table.Head>Última atualização</Table.Head>
            <Table.Head />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading ? (
            <Table.Skeleton columns={4} rows={5} />
          ) : taxes.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Percent size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum imposto vinculado</EmptyState.Title>
                  <EmptyState.Description>
                    Vincule regras de imposto a este produto para que sejam
                    aplicadas nos pedidos.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            taxes.map((tax) => (
              <Table.Row key={tax.id}>
                <Table.Cell variant="strong">{tax.taxRule.name}</Table.Cell>
                <Table.Cell>
                  <Title variant="value">
                    {formatRate(tax.rate)}
                  </Title>
                </Table.Cell>
                <Table.Cell variant="dim">
                  {formatDateDMY(tax.updatedAt)}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <EditTaxModal tax={tax} onChanged={handleChanged} />
                    <RemoveTaxModal
                      productTaxId={tax.id}
                      taxName={tax.taxRule.name}
                      onRemoved={handleChanged}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
