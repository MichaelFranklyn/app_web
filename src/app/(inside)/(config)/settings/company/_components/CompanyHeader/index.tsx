"use client";

import { DocumentNumber } from "@/components/DocumentNumber";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { MyCompany } from "../../interface";

interface Props {
  company: MyCompany;
}

/**
 * Mesmo cabeçalho das outras telas de Configurações (ícone da navegação +
 * nome), e não o avatar da empresa: a imagem já tem o card "Marca da empresa"
 * logo abaixo. O segmento também saiu daqui — é um campo do card Identificação
 * e aparecia duas vezes (crítica de configurações, 23/11/2026).
 */
export function CompanyHeader({ company }: Props) {
  const name = company.nomeFantasia ?? company.razaoSocial;

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Heading {...PAGE_HEADING.company}>
            {name}
          </PanelHeader.Heading>
          <PanelHeader.Description>
            CNPJ <DocumentNumber value={company.cnpj} />
          </PanelHeader.Description>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
