"use client";

import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

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
            <PanelHeader.Heading {...PAGE_HEADING.catalog}>
              Catálogos da empresa
            </PanelHeader.Heading>
            <PanelHeader.Description>
              Listas que o sistema oferece pronto na hora de cadastrar um
              produto ou calcular imposto. Preencha uma vez e reaproveite em
              todo o cadastro.
              {/* O total é parte da frase, não tarja: sozinha, a tarja
                  parecia um botão ou um estado, e no celular esticava na
                  largura toda (crítica de configurações, 23/11/2026). */}
              {totalItems !== null &&
                (totalItems === 1
                  ? " 1 item cadastrado ao todo."
                  : ` ${totalItems} itens cadastrados ao todo.`)}
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
