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
  mutation UpdateImportTemplate($id: UUID!, $input: UpdateImportTemplateInput!) {
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

/** Lista templates da fábrica; a UI filtra o ativo em memória. */
export const buildImportTemplatesVariables = (factoryId: string) => ({
  input: {
    first: 50,
    filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
  },
});
