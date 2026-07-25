"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";

interface Props {
  title: string;
  description: string;
}

/** Header das telas de um catálogo (categorias, unidades, rótulos, impostos). */
export function CatalogSubHeader({ title, description }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb.Root>
        <Breadcrumb.Item href="/settings/catalog">Catálogos</Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item active>{title}</Breadcrumb.Item>
      </Breadcrumb.Root>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>{title}</PanelHeader.Title>
            <PanelHeader.Description>{description}</PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
