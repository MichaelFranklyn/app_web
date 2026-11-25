import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import {
  DataCardSkeleton,
  DataSectionSkeleton,
} from "../../../../_shared/dataCards";

/**
 * Espelha `content.tsx`: o cabeçalho (ícone, nome e CNPJ) e as duas seções (título, descrição e os cards com os campos de cada um).
 *
 * Serve ao `loading.tsx` (navegação) e ao carregamento do cliente, para as duas
 * esperas terem a mesma cara.
 */
export function CompanySkeleton() {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <PanelHeader.HeadingSkeleton
          {...PAGE_HEADING.company}
          barClassName="w-[220px]"
        />
        <Loading.Skeleton text="body" className="w-[200px] max-w-full" />
      </div>

      <div className="flex flex-col gap-24">
        <DataSectionSkeleton>
          <DataCardSkeleton fields={4} note />
          <DataCardSkeleton fields={3} />
        </DataSectionSkeleton>
        <DataSectionSkeleton>
          <div className="desktop:col-span-2">
            <DataCardSkeleton fields={1} />
          </div>
          <div className="desktop:col-span-2">
            <DataCardSkeleton fields={2} />
          </div>
        </DataSectionSkeleton>
      </div>
    </PageContent>
  );
}
