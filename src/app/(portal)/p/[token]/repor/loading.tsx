import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";

/** A grade de produtos acabando — até quatro colunas, como em `content.tsx`. */
export default function PortalReplenishLoading() {
  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[4px]">
        <Title variant="eyebrow" color="muted">
          Repor
        </Title>
        <Loading.Skeleton className="h-[14px] w-[280px]" />
      </div>
      <Grid.Root cols={{ base: 1, tablet: 2, desktop: 4 }} gap={12}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Loading.Skeleton key={index} className="h-[180px] w-full" />
        ))}
      </Grid.Root>
    </div>
  );
}
