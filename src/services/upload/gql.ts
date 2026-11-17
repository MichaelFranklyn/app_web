import { gql } from "@apollo/client";

export const CREATE_UPLOAD_TICKET = gql`
  mutation CreateUploadTicket($input: CreateUploadTicketInput!) {
    createUploadTicket(input: $input) {
      status
      message
      data {
        uploadUrlPath
        ticket
        fileRef
      }
    }
  }
`;

export interface CreateUploadTicketResponse {
  createUploadTicket: {
    status: boolean;
    message: string;
    data: { uploadUrlPath: string; ticket: string; fileRef: string } | null;
  };
}
