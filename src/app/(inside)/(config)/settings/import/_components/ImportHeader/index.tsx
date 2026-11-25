import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

/** Cabeçalho fixo da Configuração inicial — o mesmo na tela e no `loading.tsx`. */
export function ImportHeader() {
  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Heading {...PAGE_HEADING.import}>
            Configuração inicial
          </PanelHeader.Heading>
          <PanelHeader.Description>
            Monte a empresa passo a passo, nesta ordem: cada passo prepara o que
            o próximo precisa.
          </PanelHeader.Description>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
