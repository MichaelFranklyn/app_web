import { PanelHeader } from "@/components/PanelHeader";

interface Props {
  dateLabel: string;
  sellerName: string | null;
}

export function VisitsHeader({ dateLabel, sellerName }: Props) {
  const description = sellerName ? `${dateLabel} · ${sellerName}` : dateLabel;

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Eyebrow>
            07 — Rotina
          </PanelHeader.Eyebrow>
          <PanelHeader.Title>
            Rota do Dia
          </PanelHeader.Title>
          <PanelHeader.Description>{description}</PanelHeader.Description>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
