import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";

/**
 * Espelha `content.tsx`: o resumo das compras em cima e os cards de pedido
 * embaixo, em duas colunas no desktop.
 *
 * A página faz duas queries no servidor (resumo de 12 meses + 1ª página de
 * pedidos) antes de renderizar. O limite do grupo já cobriu o layout; este
 * cobre a espera da própria tela, e com a forma certa — um esqueleto de
 * proporção diferente faz a página inteira se reorganizar quando os dados
 * chegam.
 */
export default function PortalPurchasesLoading() {
  return (
    <div className="flex flex-col gap-[24px]">
      <Loading.Skeleton className="h-[220px] w-full" />

      <section className="flex flex-col gap-[12px]">
        <Title variant="eyebrow" color="muted">
          Seus pedidos
        </Title>
        <div className="desktop:grid-cols-2 grid grid-cols-1 gap-[12px]">
          {Array.from({ length: 6 }).map((_, index) => (
            <Loading.Skeleton key={index} className="h-[104px] w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}
