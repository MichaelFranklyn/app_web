import { gql } from "@apollo/client";

export const GET_USER_FLOW_LAYOUT = gql`
  query userFlowLayout {
    userFlowLayout {
      status
      code
      message
      data {
        id
        flowKey
        status
        lastStep
        version
      }
    }
  }
`;

export const UPSERT_USER_FLOW_LAYOUT = gql`
  mutation upsertUserFlowLayout($input: UpsertUserFlowLayoutInput!) {
    upsertUserFlowLayout(input: $input) {
      status
      code
      message
      data {
        id
        flowKey
        status
        lastStep
        version
      }
    }
  }
`;
