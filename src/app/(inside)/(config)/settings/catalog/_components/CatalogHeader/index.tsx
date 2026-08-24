"use client";

import { Badge } from "@/components/Badges";
import { PanelHeader } from "@/components/PanelHeader";

interface Props {
  /** Total cadastrado nos cinco catálogos. Null quando a contagem não veio. */
  totalItems: number | null;
}

export function CatalogHeader({ totalItems }: Props) {
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
            {totalItems !== null && (
              <PanelHeader.Actions className="mt-6">
                <Badge.Root appearance="tinted" color="neutral" size="xs">
                  <Badge.Text>
                    {totalItems === 1
                      ? "1 item cadastrado ao todo"
                      : `${totalItems} itens cadastrados ao todo`}
                  </Badge.Text>
                </Badge.Root>
              </PanelHeader.Actions>
            )}
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
