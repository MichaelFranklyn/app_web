import { gql } from "@apollo/client";

export const MY_COMPANY_QUERY = gql`
  query MyCompany {
    my_company: myCompany {
      status
      message
      data {
        id
        cnpj
        razaoSocial
        nomeFantasia
        segment
        phone
        whatsapp
        website
        addressZip
        addressStreet
        addressNumber
        addressComplement
        addressNeighborhood
        addressCity
        addressState
        logoUrl
        avatarUrl
      }
    }
  }
`;

export const UPDATE_COMPANY_MUTATION = gql`
  mutation UpdateCompany($id: UUID!, $input: UpdateCompanyInput!) {
    updateCompany(id: $id, input: $input) {
      status
      message
      data {
        id
        segment
        phone
        whatsapp
        website
        addressZip
        addressStreet
        addressNumber
        addressComplement
        addressNeighborhood
        addressCity
        addressState
        logoUrl
        avatarUrl
      }
    }
  }
`;
