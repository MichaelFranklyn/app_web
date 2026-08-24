import { gql } from "@apollo/client";

/**
 * Quanto já existe em cada catálogo, numa consulta só.
 *
 * O índice mostrava cinco cards idênticos: quem chegava não sabia o que já
 * estava preenchido e o que nunca foi tocado — a pergunta que traz alguém a
 * esta tela. Cinco contagens custam pouco (nenhuma traz linha, só o total) e
 * saem no SSR, junto com a página.
 */
export const CATALOG_COUNTS_QUERY = gql`
  query SettingsCatalogCounts($input: BaseListInput!) {
    categories: productCategories(input: $input) {
      totalCount
    }
    units: productUnits(input: $input) {
      totalCount
    }
    labels: productUnitLabels(input: $input) {
      totalCount
    }
    segments: clientSegments(input: $input) {
      totalCount
    }
    taxRules: taxRules(input: $input) {
      totalCount
    }
  }
`;

/** Só o total interessa — nenhuma linha precisa vir junto. */
export const CATALOG_COUNTS_INPUT = { first: 1 };

export const PRODUCT_UNITS_QUERY = gql`
  query SettingsProductUnits($input: BaseListInput!) {
    productUnits(input: $input) {
      edges {
        node {
          id
          label
          isActive
        }
      }
      totalCount
    }
  }
`;

export const CREATE_PRODUCT_UNIT_MUTATION = gql`
  mutation SettingsCreateProductUnit($input: CreateProductUnitInput!) {
    createProductUnit(input: $input) {
      status
      message
      data {
        id
        label
      }
    }
  }
`;

export const UPDATE_PRODUCT_UNIT_MUTATION = gql`
  mutation SettingsUpdateProductUnit(
    $id: UUID!
    $input: UpdateProductUnitInput!
  ) {
    updateProductUnit(id: $id, input: $input) {
      status
      message
      data {
        id
        label
      }
    }
  }
`;

export const DELETE_PRODUCT_UNIT_MUTATION = gql`
  mutation SettingsDeleteProductUnit($id: UUID!) {
    deleteProductUnit(id: $id) {
      status
      message
    }
  }
`;

export const PRODUCT_UNIT_LABELS_QUERY = gql`
  query SettingsProductUnitLabels($input: BaseListInput!) {
    productUnitLabels(input: $input) {
      edges {
        node {
          id
          label
          isActive
        }
      }
      totalCount
    }
  }
`;

export const CREATE_PRODUCT_UNIT_LABEL_MUTATION = gql`
  mutation SettingsCreateProductUnitLabel(
    $input: CreateProductUnitLabelInput!
  ) {
    createProductUnitLabel(input: $input) {
      status
      message
      data {
        id
        label
      }
    }
  }
`;

export const UPDATE_PRODUCT_UNIT_LABEL_MUTATION = gql`
  mutation SettingsUpdateProductUnitLabel(
    $id: UUID!
    $input: UpdateProductUnitLabelInput!
  ) {
    updateProductUnitLabel(id: $id, input: $input) {
      status
      message
      data {
        id
        label
      }
    }
  }
`;

export const DELETE_PRODUCT_UNIT_LABEL_MUTATION = gql`
  mutation SettingsDeleteProductUnitLabel($id: UUID!) {
    deleteProductUnitLabel(id: $id) {
      status
      message
    }
  }
`;

export const TAX_RULES_QUERY = gql`
  query SettingsTaxRules($input: BaseListInput!) {
    taxRules(input: $input) {
      edges {
        node {
          id
          name
        }
      }
      totalCount
    }
  }
`;

export const CREATE_TAX_RULE_MUTATION = gql`
  mutation SettingsCreateTaxRule($input: CreateTaxRuleInput!) {
    createTaxRule(input: $input) {
      status
      message
      data {
        id
        name
      }
    }
  }
`;

export const UPDATE_TAX_RULE_MUTATION = gql`
  mutation SettingsUpdateTaxRule($id: UUID!, $input: UpdateTaxRuleInput!) {
    updateTaxRule(id: $id, input: $input) {
      status
      message
      data {
        id
        name
      }
    }
  }
`;

export const DELETE_TAX_RULE_MUTATION = gql`
  mutation SettingsDeleteTaxRule($id: UUID!) {
    deleteTaxRule(id: $id) {
      status
      message
    }
  }
`;

// Segmentos de cliente — ramo de atividade da loja (Farmácia, Mercearia…).
// Catálogo por empresa, escolhido na ficha do cliente e usado como filtro da
// carteira. Não confundir com o `segment` da categoria de PRODUTO.
export const CLIENT_SEGMENTS_QUERY = gql`
  query SettingsClientSegments($input: BaseListInput!) {
    clientSegments(input: $input) {
      edges {
        node {
          id
          name
        }
      }
      totalCount
    }
  }
`;

export const CREATE_CLIENT_SEGMENT_MUTATION = gql`
  mutation SettingsCreateClientSegment($input: CreateClientSegmentInput!) {
    createClientSegment(input: $input) {
      status
      message
      data {
        id
        name
      }
    }
  }
`;

export const UPDATE_CLIENT_SEGMENT_MUTATION = gql`
  mutation SettingsUpdateClientSegment(
    $id: UUID!
    $input: UpdateClientSegmentInput!
  ) {
    updateClientSegment(id: $id, input: $input) {
      status
      message
      data {
        id
        name
      }
    }
  }
`;

export const DELETE_CLIENT_SEGMENT_MUTATION = gql`
  mutation SettingsDeleteClientSegment($id: UUID!) {
    deleteClientSegment(id: $id) {
      status
      message
    }
  }
`;
