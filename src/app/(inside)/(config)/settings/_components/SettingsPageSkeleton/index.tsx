import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { LucideIcon } from "lucide-react";

interface Props {
  /** Ícone da tela, quando já se sabe qual vai abrir; sem ele, vira barra. */
  icon?: LucideIcon;
}

/**
 * A tela de configurações enquanto o servidor responde — cabeçalho e um bloco
 * de conteúdo. Para quem ainda não sabe a cara exata da tela: o `/settings`
 * (que só redireciona, conforme o papel) e os assistentes de importação.
 * Sem ele, o menu da área aparecia ao lado de um vazio.
 */
export function SettingsPageSkeleton({ icon }: Props) {
  return (
    <PageContent>
      <div className="flex flex-col gap-8" aria-busy="true">
        {icon ? (
          <PanelHeader.HeadingSkeleton icon={icon} barClassName="w-[220px]" />
        ) : (
          <div className="flex min-h-[41px] items-center gap-10">
            <Loading.Skeleton className="size-[32px] shrink-0" />
            <Loading.Skeleton className="h-[20px] w-[220px] max-w-full" />
          </div>
        )}
        <Loading.Skeleton text="body" className="w-[320px] max-w-full" />
      </div>
      <Loading.Skeleton className="h-[240px] w-full" />
    </PageContent>
  );
}
