import { gql } from "@apollo/client";

export const SELLERS_STATS_QUERY = gql`
  query sellersStats {
    sellersStats {
      totalCount
      activeCount
      activeFactoryAccessCount
      inactiveFactoryAccessCount
    }
  }
`;
