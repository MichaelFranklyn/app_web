"use client";

import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { useRefetchQueriesClient } from "@/hooks/useInvalidateQueries";
import { useQuery } from "@apollo/client/react";
import { PackageX } from "lucide-react";
import { useCallback } from "react";
import { ComponentsTable } from "./_components/ComponentsTable";
import { PricesTable } from "./_components/PricesTable";
import { PRICE_LIST_ITEMS_QUERY } from "./_components/PricesTable/gql";
import { ProductDetailHeader } from "./_components/ProductDetailHeader";
import { ProductDetailSkeleton } from "./_components/ProductDetailSkeleton";
import { ProductInfoCard } from "./_components/ProductInfoCard";
import { TaxesTable } from "./_components/TaxesTable";
import { PRODUCT_DETAIL_QUERY } from "./gql";
import { ProductDetailResponse } from "./interface";

interface Props {
  id: string;
}

export default function ProductDetailContent({ id }: Props) {
  const refetchClient = useRefetchQueriesClient();
  const { data, loading, refetch } = useQuery<ProductDetailResponse>(
    PRODUCT_DETAIL_QUERY,
    { variables: { id } }
  );

  // Mudou um imposto → o back recalcula o preço c/ imposto das tabelas ativas;
  // ressincroniza a tabela de preços para refletir os novos valores.
  const handleTaxesChanged = useCallback(() => {
    refetchClient([PRICE_LIST_ITEMS_QUERY]);
  }, [refetchClient]);

  const product = data?.product_detail?.data;

  if (loading && !product) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center pt-20">
        <EmptyState.Root className="max-w-105">
          <EmptyState.Icon>
            <PackageX size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Produto não encontrado</EmptyState.Title>
          <EmptyState.Description>
            O produto que você procura não existe ou foi removido.
          </EmptyState.Description>
        </EmptyState.Root>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-20">
      <ProductDetailHeader product={product} onRefetch={refetch} />

      <Grid cols={{ base: 1, desktop: 3 }} gap={20}>
        <Grid.Item
          span={{ base: 1, desktop: 2 }}
          className="min-w-0"
          data-tour="product-prices"
        >
          <PricesTable
            productId={id}
            companyFactoryId={product.companyFactory?.id ?? ""}
            unitPerPack={product.unitPerPack}
            baseUnitLabel={product.unit?.label ?? null}
            packLabel={product.unitLabel?.label ?? null}
          />
        </Grid.Item>

        <Grid.Item
          span={{ base: 1, desktop: 1 }}
          className="flex flex-col gap-12"
        >
          <div data-tour="product-info">
            <ProductInfoCard product={product} />
          </div>
          <div data-tour="product-taxes">
            <TaxesTable productId={id} onChanged={handleTaxesChanged} />
          </div>
          <div data-tour="product-components">
            <ComponentsTable
              productId={id}
              companyFactoryId={product.companyFactory?.id ?? ""}
            />
          </div>
        </Grid.Item>
      </Grid>
    </div>
  );
}
