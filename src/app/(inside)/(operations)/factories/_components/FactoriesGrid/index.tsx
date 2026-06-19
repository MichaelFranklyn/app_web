"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { Pagination } from "@/components/Pagination";
import { useNavigation } from "@/hooks/useNavigation";
import { maskCNPJ } from "@/utils/format/masks";
import { Factory, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CompanyFactory } from "../../interface";
import {
  formatCommissionRate,
  getContractStatus,
  isContractExpired,
} from "../../utils";
import { FactoriesGridSkeleton } from "../FactoriesGridSkeleton";

interface Props {
  items: CompanyFactory[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export function FactoriesGrid({
  items,
  loading,
  currentPage,
  totalPages,
  setCurrentPage,
}: Props) {
  const { navigateTo, isPending } = useNavigation();
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending) setPendingId(null);
  }, [isPending]);

  const handleNavigate = (id: string) => {
    setPendingId(id);
    navigateTo(`/factories/${id}/overview`);
  };

  const visibleItems = items.filter((cf) => cf.factory != null);

  if (loading && visibleItems.length === 0) {
    return <FactoriesGridSkeleton />;
  }

  if (!loading && visibleItems.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon><Factory size={32} /></EmptyState.Icon>
        <EmptyState.Title>Nenhuma fábrica vinculada</EmptyState.Title>
        <EmptyState.Description>
          Você ainda não vinculou nenhuma fábrica. Clique em &quot;Vincular Fábrica&quot; para começar.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  return (
    <div className="flex flex-col gap-16">
      <Grid.Root cols={{ base: 1, tablet: 2, desktop: 3 }} gap={12}>
        {visibleItems.map((cf) => {
          const name = cf.factory.nomeFantasia ?? cf.factory.razaoSocial;
          const city = [cf.factory.addressCity, cf.factory.addressState]
            .filter(Boolean)
            .join(" / ");
          const contract = getContractStatus(cf.contractEnd);
          const isActive = !cf.factory.deletedAt;
          const isExpired = isContractExpired(cf.contractEnd);

          return (
            <Grid.Item key={cf.id}>
              <Card.Root className="h-full">
                <Card.Body>
                  <div className="mb-12 flex items-start justify-between">
                    <div className="min-w-0">
                      <div
                        className="line-clamp-2 min-h-[36px] font-head text-[15px] font-bold leading-[18px] text-(--text)"
                        title={name}
                      >
                        {name}
                      </div>
                      <div className="mt-[2px] text-[12px] text-(--muted)">
                        {maskCNPJ(cf.factory.cnpj)}
                      </div>
                      {city && (
                        <div className="text-[12px] text-(--muted)">
                          {city}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-6">
                      {isExpired && (
                        <Badge.Root color="red" appearance="solid">
                          <Badge.Text>Contrato expirado</Badge.Text>
                        </Badge.Root>
                      )}
                      <Badge.Root
                        color={isActive ? "green" : "red"}
                        appearance="tinted"
                      >
                        <Badge.Text>
                          {isActive ? "Ativa" : "Inativa"}
                        </Badge.Text>
                      </Badge.Root>
                    </div>
                  </div>

                  <Card.Item variant="stat">
                    <Card.Item.Label>Comissão</Card.Item.Label>
                    <Card.Item.Value color="amber">
                      {formatCommissionRate(cf.commissionRate)}
                    </Card.Item.Value>
                  </Card.Item>
                  <Card.Item variant="stat">
                    <Card.Item.Label>Base de cálculo</Card.Item.Label>
                    <Card.Item.Value>{cf.commissionCalcBasis}</Card.Item.Value>
                  </Card.Item>
                  <Card.Item variant="stat">
                    <Card.Item.Label>Dia de pagamento da fábrica</Card.Item.Label>
                    <Card.Item.Value>Dia {cf.paymentTermDays}</Card.Item.Value>
                  </Card.Item>
                  <Card.Item variant="stat" bordered={false}>
                    <Card.Item.Label>Contrato</Card.Item.Label>
                    <Card.Item.Value color={contract.color}>
                      {contract.label}
                    </Card.Item.Value>
                  </Card.Item>

                  <Button.Root
                    appearance="outline"
                    color="neutral"
                    size="sm"
                    className="mt-12 w-full justify-center"
                    noUppercase
                    disabled={isPending}
                    onClick={() => handleNavigate(cf.id)}
                  >
                    {pendingId === cf.id && (
                      <Loader2 className="shrink-0 animate-spin" size={14} />
                    )}
                    <Button.Title>Ver detalhes →</Button.Title>
                  </Button.Root>
                </Card.Body>
              </Card.Root>
            </Grid.Item>
          );
        })}
      </Grid.Root>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination.Root>
            <Pagination.Prev
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            />
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const page =
                totalPages <= 7
                  ? i + 1
                  : Math.max(1, currentPage - 2) + i;
              return page <= totalPages ? (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              ) : null;
            })}
            <Pagination.Next
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            />
          </Pagination.Root>
        </div>
      )}
    </div>
  );
}
