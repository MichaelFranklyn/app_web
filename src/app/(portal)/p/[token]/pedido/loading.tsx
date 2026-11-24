import { Loading } from "@/components/Loading";
import { PortalPageHeader } from "../_components/PortalPageHeader";
import { ORDER_PAGE_DESCRIPTION } from "./utils";

/**
 * O cabeçalho de verdade (é estático), a barra de fábrica + busca, as
 * tabelas de produto e a lista do cliente ao lado — como em `content.tsx`.
 */
export default function PortalOrderLoading() {
  return (
    <div className="flex flex-col gap-20">
      <PortalPageHeader
        heading="newOrder"
        title="Fazer pedido"
        description={ORDER_PAGE_DESCRIPTION}
      />
      <Loading.Skeleton className="h-[88px] w-full" />
      <div className="desktop:grid-cols-[minmax(0,1fr)_360px] grid grid-cols-1 items-start gap-20">
        <div className="flex flex-col gap-20">
          <Loading.Skeleton className="h-[320px] w-full" />
          <Loading.Skeleton className="h-[480px] w-full" />
        </div>
        <Loading.Skeleton className="h-[240px] w-full" />
      </div>
    </div>
  );
}
