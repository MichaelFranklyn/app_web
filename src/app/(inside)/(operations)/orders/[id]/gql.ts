import { gql } from "@apollo/client";

export const ORDER_DETAIL_QUERY = gql`
  query OrderDetail($id: UUID!) {
    order(id: $id) {
      status
      code
      message
      data {
        id
        orderDate
        totalAmount
        commissionAmount
        status
        freightType
        fileUrl
        fileParsed
        notes
        createdAt
        seller {
          id
          name
        }
        client {
          id
          razaoSocial
          nomeFantasia
        }
        factory {
          id
          nomeFantasia
          razaoSocial
        }
      }
    }
  }
`;
