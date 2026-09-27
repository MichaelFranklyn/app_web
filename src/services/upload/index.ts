"use client";

import { useApolloClient } from "@apollo/client/react";
import { useCallback } from "react";

import { CREATE_UPLOAD_TICKET, CreateUploadTicketResponse } from "./gql";

/**
 * O que o envio já faz com o arquivo. `PRICE_LIST_PDF`: a API lê a grade da
 * tabela durante o próprio envio (1 a 3 min num PDF grande), fora do BFF da
 * Vercel — a mutation seguinte só busca o resultado.
 */
export type UploadPurpose = "RAW" | "PRICE_LIST_PDF";

/** Origem da API (o backend no Cloud Run), a mesma da mídia (`mediaUrl`). */
const apiOrigin = (): string =>
  new URL(process.env.NEXT_PUBLIC_GRAPHQL_API_HOST ?? "").origin;

/**
 * Envia um arquivo DIRETO à API e devolve a referência dele (`fileRef`).
 *
 * O caminho de sempre (base64 dentro da mutation, pelo BFF da Vercel) morre em
 * 4,5 MB de corpo — um PDF de tabela de ~3,3 MB já não passava em produção.
 * Aqui o BFF só pede o tíquete (pequeno, autenticado pelo cookie); o arquivo
 * vai cru num PUT para o backend, que aceita até 15 MB. A mutation que usa o
 * arquivo recebe a referência no lugar do base64.
 */
export function useFileUpload() {
  const client = useApolloClient();

  return useCallback(
    async (file: File, purpose: UploadPurpose = "RAW"): Promise<string> => {
      const res = await client.mutate<CreateUploadTicketResponse>({
        mutation: CREATE_UPLOAD_TICKET,
        variables: { input: { fileName: file.name, size: file.size, purpose } },
      });
      const ticket = res.data?.createUploadTicket;
      if (!ticket?.status || !ticket.data) {
        throw new Error(
          ticket?.message ?? "Não foi possível enviar o arquivo."
        );
      }

      let response: Response;
      try {
        response = await fetch(`${apiOrigin()}${ticket.data.uploadPath}`, {
          method: "PUT",
          body: file,
        });
      } catch {
        throw new Error("Sem conexão para enviar o arquivo. Tente de novo.");
      }
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(body?.message ?? "Não foi possível enviar o arquivo.");
      }
      return ticket.data.fileRef;
    },
    [client]
  );
}
