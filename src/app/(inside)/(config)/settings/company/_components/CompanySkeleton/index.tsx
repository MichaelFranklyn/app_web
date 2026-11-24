import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { DataCardSkeleton } from "../../../../_shared/dataCards";

/**
 * Espelha `content.tsx`: o cabeçalho (ícone, nome e CNPJ) e os quatro cards de assunto com os campos de cada um.
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
        <Loading.Skeleton className="h-[14px] w-[200px] max-w-full" />
      </div>

      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
        <Grid.Item>
          <DataCardSkeleton fields={4} note />
        </Grid.Item>
        <Grid.Item>
          <DataCardSkeleton fields={3} />
        </Grid.Item>
        <Grid.Item>
          <DataCardSkeleton fields={1} />
        </Grid.Item>
        <Grid.Item>
          <DataCardSkeleton fields={2} />
        </Grid.Item>
      </Grid.Root>
    </PageContent>
  );
}
