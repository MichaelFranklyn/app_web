import { gql } from "@apollo/client";

// Clientes da carteira (com coordenada) para o radar de proximidade. Escopado no
// backend pela carteira do vendedor logado (gestor vê a empresa inteira).
export const RADAR_CLIENTS_QUERY = gql`
  query RadarClients {
    radarClients {
      id
      razaoSocial
      nomeFantasia
      latitude
      longitude
      addressStreet
      addressNumber
      addressNeighborhood
      addressCity
      addressState
      companyClient {
        id
        visitScoreTotal
      }
    }
  }
`;
