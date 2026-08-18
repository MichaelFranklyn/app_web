import { gql } from "@apollo/client";

export const UPDATE_SELLER_COMMISSION_AGREEMENT_MUTATION = gql`
  mutation UpdateSellerCommissionAgreement(
    $id: UUID!
    $input: UpdateSellerFactoryAccessInput!
  ) {
    updateSellerFactoryAccess(id: $id, input: $input) {
      status
      message
    }
  }
`;
