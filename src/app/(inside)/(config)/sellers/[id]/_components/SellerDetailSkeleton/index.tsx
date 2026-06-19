import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";

const TAB_COUNT = 3;

/**
 * Placeholder da página de detalhe do vendedor: cabeçalho (breadcrumb +
 * PanelHeader) e a barra de abas.
 */
export function SellerDetailSkeleton() {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-[8px]">
          <Loading.Skeleton className="h-[12px] w-20" />
          <Loading.Skeleton className="h-[12px] w-24" />
        </div>
        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Eyebrow>
                <Loading.Skeleton className="h-[10px] w-24" />
              </PanelHeader.Eyebrow>
              <Loading.Skeleton className="h-[20px] w-56" />
              <Loading.Skeleton className="mt-[6px] h-[12px] w-72" />
              <PanelHeader.Actions className="mt-6">
                <Loading.Skeleton className="h-[22px] w-16 rounded-full" />
                <Loading.Skeleton className="h-[36px] w-24" />
              </PanelHeader.Actions>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      <div className="flex gap-16 border-b border-(--border) pb-[10px]">
        {Array.from({ length: TAB_COUNT }).map((_, i) => (
          <Loading.Skeleton key={i} className="h-[14px] w-20" />
        ))}
      </div>
    </PageContent>
  );
}
