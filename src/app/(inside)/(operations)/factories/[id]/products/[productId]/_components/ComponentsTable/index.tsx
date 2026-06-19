"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatNumber } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { Boxes } from "lucide-react";
import Link from "next/link";
import { AddComponentModal } from "./AddComponentModal";
import { EditComponentModal } from "./EditComponentModal";
import { PRODUCT_COMPONENTS_QUERY } from "./gql";
import { ProductComponentsData } from "./interface";
import { RemoveComponentModal } from "./RemoveComponentModal";

interface Props {
  productId: string;
  companyFactoryId: string;
}

export function ComponentsTable({ productId, companyFactoryId }: Props) {
  const { data, loading, refetch } = useQuery<ProductComponentsData>(
    PRODUCT_COMPONENTS_QUERY,
    { variables: { id: productId } }
  );

  const components = data?.product_components_detail?.data?.components ?? [];

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Composição do kit
          <HelpTooltip
            label="O que é a composição?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Produto kit
                </Title>
                <Title variant="body-sm">
                  Um kit é montado a partir de outros produtos do mesmo
                  catálogo (ex.: padrão de entrada = disjuntor + caixa +
                  haste). O kit tem SKU e preço próprios na tabela.
                </Title>
                <Title variant="body-sm" color="muted">
                  Produtos simples não têm composição — deixe vazio.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <AddComponentModal
            kitProductId={productId}
            companyFactoryId={companyFactoryId}
            usedProductIds={components.map((c) => c.componentProductId)}
            onAdded={() => refetch()}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Componente</Table.Head>
            <Table.Head>Qtd. no kit</Table.Head>
            <Table.Head />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading ? (
            <Table.Skeleton columns={3} rows={3} />
          ) : components.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={3}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Boxes size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Produto simples</EmptyState.Title>
                  <EmptyState.Description>
                    Adicione componentes para transformar este produto em um
                    kit.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            components.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>
                  <div className="flex flex-col">
                    {item.component ? (
                      <Link
                        href={`/factories/${companyFactoryId}/products/${item.component.id}`}
                        className="hover:underline"
                      >
                        <Table.CellText variant="strong">
                          {item.component.name}
                        </Table.CellText>
                      </Link>
                    ) : (
                      <Table.CellText variant="strong">—</Table.CellText>
                    )}
                    <Table.CellText variant="dim2">
                      {item.component?.sku ?? ""}
                    </Table.CellText>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Title variant="value">
                    {formatNumber(Number(item.quantity))}
                    {item.component?.unitLabel
                      ? ` ${item.component.unitLabel.label.toLowerCase()}(s)`
                      : ""}
                  </Title>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <EditComponentModal
                      component={item}
                      onChanged={() => refetch()}
                    />
                    <RemoveComponentModal
                      componentId={item.id}
                      componentName={item.component?.name ?? "componente"}
                      onRemoved={() => refetch()}
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
