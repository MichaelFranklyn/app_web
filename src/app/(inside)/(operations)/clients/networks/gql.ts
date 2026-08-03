import { gql } from "@apollo/client";

// Redes da empresa com os agregados consolidados das lojas. `storeCount`,
// `invoicedAmount` e `lastOrderDate` saem do mesmo DataLoader no backend, então
// pedir os três não custa mais do que pedir um.
export const CLIENT_NETWORKS_QUERY = gql`
  query ClientNetworks($input: BaseListInput!) {
    client_networks: clientNetworks(input: $input) {
      edges {
        node {
          id
          name
          notes
          isActive
          storeCount
          invoicedAmount
          lastOrderDate
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const CREATE_CLIENT_NETWORK_MUTATION = gql`
  mutation CreateClientNetwork($input: CreateClientNetworkInput!) {
    createClientNetwork(input: $input) {
      status
      message
      data {
        id
        name
        notes
        isActive
        storeCount
        invoicedAmount
        lastOrderDate
      }
    }
  }
`;

export const UPDATE_CLIENT_NETWORK_MUTATION = gql`
  mutation UpdateClientNetwork($id: UUID!, $input: UpdateClientNetworkInput!) {
    updateClientNetwork(id: $id, input: $input) {
      status
      message
      data {
        id
        name
        notes
        isActive
      }
    }
  }
`;

export const DELETE_CLIENT_NETWORK_MUTATION = gql`
  mutation DeleteClientNetwork($id: UUID!) {
    deleteClientNetwork(id: $id) {
      status
      message
    }
  }
`;
