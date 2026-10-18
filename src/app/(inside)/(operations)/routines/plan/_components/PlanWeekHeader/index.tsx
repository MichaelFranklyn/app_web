"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";

interface Props {
  sellerId: string | null;
}

/**
 * "Montar semana". O vendedor da agenda se escolhe na linha da busca. A
 * semana NÃO se escolhe aqui — ela é parte da configuração que o vendedor faz
 * ao organizar (com as visitas e as ligações por dia), depois de escolher os
 * clientes.
 */
export function PlanWeekHeader({ sellerId }: Props) {
  const backHref = `/routines${sellerId ? `?sellerId=${sellerId}` : ""}`;

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb.Root>
        <Breadcrumb.Item href={backHref}>Agenda</Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item active>Montar semana</Breadcrumb.Item>
      </Breadcrumb.Root>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Montar semana</PanelHeader.Title>
            <PanelHeader.Description>
              Monte a sua agenda em dois passos: escolha os clientes e organize
              a semana. O sistema separa por região e monta o caminho de cada
              dia.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
