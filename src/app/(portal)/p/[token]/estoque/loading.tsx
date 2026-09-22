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
      <div className="tablet:grid-cols-2 desktop:grid-cols-4 grid grid-cols-1 gap-[12px]">
        {Array.from({ length: 12 }).map((_, index) => (
          <Loading.Skeleton key={index} className="h-[160px] w-full" />
        ))}
      </div>
    </div>
  );
}
