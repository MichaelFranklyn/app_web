import { gql } from "@apollo/client";

export const WALLET_COVERAGE_QUERY = gql`
  query WalletCoverageBySeller(
    $from: Date
    $to: Date
    $sellerId: UUID
    $limit: Int
  ) {
    walletCoverageBySeller(
      from: $from
      to: $to
      sellerId: $sellerId
      limit: $limit
    ) {
      entityId
      entityName
      walletClients
      activeClients
      coverageRate
    }
  }
`;
