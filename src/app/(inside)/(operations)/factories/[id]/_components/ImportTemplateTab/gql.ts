import { gql } from "@apollo/client";

/** Templates de importação da fábrica (escopados à empresa pelo backend). */
export const IMPORT_TEMPLATES_QUERY = gql`
  query ImportTemplates($input: BaseListInput!) {
    importTemplates(input: $input) {
      edges {
        node {
          id
          factoryId
          target
          fileType
          parserStrategy
          config
          sampleFileUrl
          version
          isActive
        }
      }
      # O total é o que denuncia truncamento (ver useCompleteList).
      totalCount
    }
  }
`;

export const CREATE_IMPORT_TEMPLATE_MUTATION = gql`
  mutation CreateImportTemplate($input: CreateImportTemplateInput!) {
    createImportTemplate(input: $input) {
      status
      message
      data {
        id
      }
    }
  }
`;

export const UPDATE_IMPORT_TEMPLATE_MUTATION = gql`
  mutation UpdateImportTemplate(
    $id: UUID!
    $input: UpdateImportTemplateInput!
  ) {
    updateImportTemplate(id: $id, input: $input) {
      status
      message
      data {
        id
      }
    }
  }
`;

export const DELETE_IMPORT_TEMPLATE_MUTATION = gql`
  mutation DeleteImportTemplate($id: UUID!) {
    deleteImportTemplate(id: $id) {
      status
      message
    }
  }
`;

/** Extrai os itens de um PDF aplicando uma receita avulsa (pré-visualização). */
export const EXTRACT_ORDER_FILE_PREVIEW_MUTATION = gql`
  mutation ExtractOrderFilePreview($input: ExtractOrderFileInput!) {
    extractOrderFile(input: $input) {
      status
      message
      data {
        fileType
        detectedPreset
        items {
          sku
          name
          quantity
          unitPrice
          priceOptions
        }
      }
    }
  }
`;

/**
 * Escopo da lista de modelos da fábrica; a UI filtra o ativo em memória.
 *
 * Sem `first`: quem consome é o `useCompleteList`, que traz a lista inteira e
 * rebusca pelo total quando a primeira página não dá conta. Era o último teto
 * fixo da área — pequeno na prática (uma fábrica tem um ou dois modelos), mas
 * é o mesmo padrão que já escondeu catálogo em outra tela.
 */
export const buildImportTemplatesInput = (factoryId: string) => ({
  filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
});
