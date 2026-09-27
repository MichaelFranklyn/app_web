import { gql } from "@apollo/client";

export const CREATE_UPLOAD_TICKET = gql`
  mutation CreateUploadTicket($input: CreateUploadTicketInput!) {
    createUploadTicket(input: $input) {
      status
      message
      data {
        uploadPath
        fileRef
      }
    }
  }
`;

export interface CreateUploadTicketResponse {
  createUploadTicket: {
    status: boolean;
    message: string;
    data: { uploadPath: string; fileRef: string } | null;
  };
}
