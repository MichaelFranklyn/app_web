import { gql } from "@apollo/client";

export const PRODUCT_DETAIL_QUERY = gql`
  query ProductDetail($id: UUID!) {
    product_detail: product(id: $id) {
      status
      message
      data {
        id
        name
        sku
        unitPerPack
        ncm
        saleMultiple
        isActive
        unitId
        unitLabelId
        unit {
          id
          label
        }
        unitLabel {
          id
          label
        }
        companyFactory {
          id
          factory {
            id
            razaoSocial
            nomeFantasia
          }
        }
        category {
          id
          name
          segment
        }
        createdAt
        updatedAt
      }
    }
  }
`;
