import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";

const TAB_COUNT = 5;

/**
 * Placeholder da página de detalhe da fábrica: cabeçalho (breadcrumb +
 * PanelHeader) e a barra de abas. Usado enquanto o detalhe carrega.
 */
export function FactoryDetailSkeleton() {
  return (
    <PageContent>
      <div className="flex flex-col gap-12">
        <div className="flex items-center gap-[8px]">
          <Loading.Skeleton className="h-[12px] w-16" />
          <Loading.Skeleton className="h-[12px] w-24" />
        </div>

        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Eyebrow>
                <Loading.Skeleton className="h-[10px] w-24" />
              </PanelHeader.Eyebrow>
              <Loading.Skeleton className="h-[20px] w-64" />
              <Loading.Skeleton className="mt-[6px] h-[12px] w-80" />
              <PanelHeader.Actions className="mt-6">
                <Loading.Skeleton className="h-[22px] w-16 rounded-(--r-xs)" />
                <Loading.Skeleton className="h-[36px] w-24" />
              </PanelHeader.Actions>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      <div className="flex gap-16 border-b border-(--border) pb-[10px]">
        {Array.from({ length: TAB_COUNT }).map((_, i) => (
          <Loading.Skeleton key={i} className="h-[14px] w-24" />
        ))}
      </div>
    </PageContent>
  );
}
