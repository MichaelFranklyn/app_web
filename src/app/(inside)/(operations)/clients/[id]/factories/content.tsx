"use client";

import { Loading } from "@/components/Loading";
import { Table } from "@/components/Table";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useClientRoute } from "../context";
import { SellerClientFactory } from "../interface";
import { useClientFactoryLinks } from "../useClientFactoryLinks";
import { FactoryLinksTable } from "./_components/FactoryLinksTable";

export default function FactoriesContent() {
  const { clientId: id } = useClientRoute();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [autoOpenLink, setAutoOpenLink] = useState(false);

  // Fluxo pós-criação: ?link=1 abre o modal uma vez e o parâmetro é removido
  // da URL para não reabrir em refresh/voltar.
  useEffect(() => {
    if (searchParams.get("link") === "1") {
      setAutoOpenLink(true);
      router.replace(pathname);
    }
  }, [searchParams, router, pathname]);

  // Mesma busca da Visão Geral, no hook do pai: as variáveis batem e as duas
  // abas dividem a resposta no cache — trocar de aba não volta à rede.
  const { links, loading, refetch } = useClientFactoryLinks(id);

  const optimisticLinks = useOptimisticList<SellerClientFactory>({
    initialData: links,
  });

  if (loading && links.length === 0) {
    return (
      <Table.Root>
        <div className="flex flex-col gap-8 p-24">
          <Loading.Skeleton className="h-[16px] w-1/4" />
          <Loading.Skeleton className="h-[40px] w-full" />
          <Loading.Skeleton className="h-[40px] w-full" />
        </div>
      </Table.Root>
    );
  }

  return (
    <FactoryLinksTable
      clientId={id}
      connections={optimisticLinks.items}
      onChanged={() => refetch()}
      autoOpenLink={autoOpenLink}
      onUpdateOptimistic={optimisticLinks.updateOptimistic}
      onRemoveOptimistic={optimisticLinks.removeOptimistic}
      onCommit={optimisticLinks.commit}
      onRollback={optimisticLinks.rollback}
    />
  );
}
