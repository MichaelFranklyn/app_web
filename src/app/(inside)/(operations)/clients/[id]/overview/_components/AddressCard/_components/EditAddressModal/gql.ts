import { gql } from "@apollo/client";

export const UPDATE_ADDRESS_MUTATION = gql`
  mutation UpdateClientAddress($id: UUID!, $input: UpdateClientAddressInput!) {
    updateClientAddress(id: $id, input: $input) {
      status
      code
      message
      data {
        id
        addressStreet
        addressNumber
        addressComplement
        addressCity
        addressState
        addressZip
      }
    }
  }
`;
