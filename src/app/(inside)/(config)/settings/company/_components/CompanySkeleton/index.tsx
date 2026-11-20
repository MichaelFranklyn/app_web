import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { DataCardSkeleton } from "../../../../_shared/dataCards";

/**
 * Espelha `content.tsx`: o cabeçalho (símbolo, nome, CNPJ e o segmento, que no
 * celular toma a linha) e os quatro cards de assunto com os campos de cada um.
 *
 * Serve ao `loading.tsx` (navegação) e ao carregamento do cliente, para as duas
 * esperas terem a mesma cara.
 */
export function CompanySkeleton() {
  return (
    <PageContent>
      <div className="flex flex-col gap-12">
        <div className="flex items-center gap-12">
          <Loading.Skeleton shape="pill" className="size-[48px] shrink-0" />
          <div className="flex min-w-0 flex-col gap-8">
            <Loading.Skeleton className="h-[26px] w-[180px] max-w-full" />
            <Loading.Skeleton className="h-[14px] w-[200px] max-w-full" />
          </div>
        </div>
        <Loading.Skeleton
          shape="pill"
          className="tablet:w-[180px] h-[28px] w-full"
        />
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
