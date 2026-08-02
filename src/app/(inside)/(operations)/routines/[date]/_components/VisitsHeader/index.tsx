import { PanelHeader } from "@/components/PanelHeader";
import { ReactNode } from "react";

interface Props {
  dateLabel: string;
  sellerName: string | null;
  /** Ações do dia (imprimir a rota); ausente enquanto não há rota gerada. */
  actions?: ReactNode;
}

export function VisitsHeader({ dateLabel, sellerName, actions }: Props) {
  const description = sellerName ? `${dateLabel} · ${sellerName}` : dateLabel;

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Title>Rota do Dia</PanelHeader.Title>
          <PanelHeader.Description>{description}</PanelHeader.Description>
          {/* Ações em linha própria abaixo do título, como nos demais headers
              de página: dentro do Top elas disputavam a largura com o título,
              que quebrava letra a letra. */}
          {actions && (
            <PanelHeader.Actions className="mt-6">
              {actions}
            </PanelHeader.Actions>
          )}
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
