import { Loading } from "@/components/Loading";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

/** Limite próprio: sem ele, o toque no card mostraria o esqueleto da lista. */
export default function PortalSentOrderLoading() {
  return (
    <>
      <div className="flex flex-col gap-8">
        <Loading.Skeleton className="h-[16px] w-[180px]" />
        <PanelHeader.HeadingSkeleton
          {...PAGE_HEADING.orders}
          barClassName="w-[200px]"
        />
      </div>
      <div className="desktop:flex-row flex flex-col gap-20">
        <Loading.Skeleton className="h-[320px] w-full flex-1" />
        <Loading.Skeleton className="desktop:w-[320px] h-[200px] w-full shrink-0" />
      </div>
    </>
  );
}
