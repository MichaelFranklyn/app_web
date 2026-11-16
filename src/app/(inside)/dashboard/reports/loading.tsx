import { Loading } from "@/components/Loading";

// Renderiza DENTRO do layout dos relatórios: caminho, cabeçalho e abas já
// estão na tela, então este limite cobre só o corpo da aba. Sem ele as abas
// herdavam o `loading.tsx` do /dashboard — o título "Dashboard" e os cards
// dele piscavam ao trocar de relatório (14/11/2026).
//
// Mesma ordem das abas: barra (período, vendedor, Exportar), KPIs, gráfico e
// tabela. Só divs + `Loading.Skeleton` — peças compostas de módulo client
// chegariam opacas aqui, que é server.
export default function ReportLoading() {
  return (
    <div className="flex flex-col gap-12">
      <div className="desktop:flex-row desktop:items-center flex flex-col gap-8">
        <Loading.Skeleton className="desktop:w-[220px] h-[36px] w-full" />
        <Loading.Skeleton className="desktop:w-[220px] h-[36px] w-full" />
        <Loading.Skeleton className="desktop:ml-auto h-[36px] w-[120px]" />
      </div>

      <div className="desktop-xl:grid-cols-4 grid grid-cols-2 gap-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <Loading.Skeleton key={i} className="h-[104px] w-full" />
        ))}
      </div>

      <Loading.Skeleton className="h-[300px] w-full" />
      <Loading.Skeleton className="h-[320px] w-full" />
    </div>
  );
}
