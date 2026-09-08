import { gql } from "@apollo/client";

export const WALLET_COVERAGE_QUERY = gql`
  query WalletCoverageBySeller(
    $from: Date
    $to: Date
    $sellerId: UUID
    $factoryId: UUID
    $limit: Int
  ) {
    walletCoverageBySeller(
      from: $from
      to: $to
      sellerId: $sellerId
      factoryId: $factoryId
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
