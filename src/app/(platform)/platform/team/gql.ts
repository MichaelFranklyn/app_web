import { gql } from "@apollo/client";

export const PLATFORM_STAFF_QUERY = gql`
  query PlatformStaff {
    platformStaff {
      status
      code
      message
      data {
        id
        name
        email
        role
        isActive
        lastLoginAt
        createdAt
        anchorCompanyName
      }
    }
  }
`;

/** Cria uma conta de SUPORTE. O papel não vai no input de propósito: esta porta
 * não concede SU — para isso existe o comando no servidor. */
export const CREATE_PLATFORM_USER_MUTATION = gql`
  mutation CreatePlatformUser($input: CreatePlatformUserInput!) {
    createPlatformUser(input: $input) {
      status
      code
      message
      data {
        userId
        name
        email
        role
        link
      }
    }
  }
`;

export const SET_PLATFORM_USER_STATUS_MUTATION = gql`
  mutation SetPlatformUserStatus(
    $userId: UUID!
    $input: SetPlatformUserStatusInput!
  ) {
    setPlatformUserStatus(userId: $userId, input: $input) {
      status
      code
      message
      data {
        userId
        name
        email
        role
        isActive
      }
    }
  }
`;
