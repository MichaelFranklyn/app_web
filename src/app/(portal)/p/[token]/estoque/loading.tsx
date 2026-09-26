import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";

/**
 * A grade de produtos do formulário de estoque — até quatro colunas, como em
 * `content.tsx`.
 *
 * A lista passa de 40 produtos, então o esqueleto mostra uma tela cheia: com
 * duas ou três caixas, o cliente lê "acabou" e sai antes de a lista chegar.
 */
export default function PortalStockLoading() {
  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[4px]">
        <Title variant="eyebrow" color="muted">
          Meu estoque
        </Title>
        <Loading.Skeleton className="h-[14px] w-[280px]" />
      </div>
      <Grid.Root cols={{ base: 1, tablet: 2, desktop: 4 }} gap={12}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Loading.Skeleton key={index} className="h-[160px] w-full" />
        ))}
      </Grid.Root>
    </div>
  );
}
