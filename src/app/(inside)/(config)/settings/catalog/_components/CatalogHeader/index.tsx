"use client";

import { PanelHeader } from "@/components/PanelHeader";

export function CatalogHeader() {
  return (
    <div className="flex flex-col gap-8">
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Catálogos da empresa</PanelHeader.Title>
            <PanelHeader.Description>
              Listas que o sistema oferece pronto na hora de cadastrar um
              produto ou calcular imposto. Preencha uma vez e reaproveite em
              todo o cadastro.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
