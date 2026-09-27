import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock("@apollo/client/react", () => ({
  useApolloClient: () => ({ mutate }),
}));

import { useFileUpload } from "./index";

const file = new File(["%PDF-1.4"], "tabela.pdf", { type: "application/pdf" });
const ticketOk = {
  data: {
    createUploadTicket: {
      status: true,
      message: "OK",
      data: { uploadPath: "/uploads/TIQUETE", fileRef: "uploads/e/a.pdf" },
    },
  },
};

beforeEach(() => {
  mutate.mockReset();
  vi.stubEnv("NEXT_PUBLIC_GRAPHQL_API_HOST", "https://api.exemplo.com/graphql");
});

describe("useFileUpload", () => {
  it("pede o tíquete pelo BFF e envia o arquivo cru direto à API", async () => {
    mutate.mockResolvedValue(ticketOk);
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const upload = renderHook(() => useFileUpload()).result.current;
    const ref = await upload(file);

    expect(ref).toBe("uploads/e/a.pdf");
    expect(mutate.mock.calls[0][0].variables).toEqual({
      input: { fileName: "tabela.pdf", size: file.size, purpose: "RAW" },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.exemplo.com/uploads/TIQUETE",
      expect.objectContaining({ method: "PUT", body: file })
    );
  });

  it("tíquete recusado (tipo ou tamanho) nem tenta enviar", async () => {
    mutate.mockResolvedValue({
      data: {
        createUploadTicket: {
          status: false,
          message: "Arquivo muito grande para enviar (máx. 15 MB).",
          data: null,
        },
      },
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const upload = renderHook(() => useFileUpload()).result.current;

    await expect(upload(file)).rejects.toThrow("máx. 15 MB");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("recusa da API no envio vira a mensagem dela", async () => {
    mutate.mockResolvedValue(ticketOk);
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ message: "Envio não autorizado ou expirado." }),
            {
              status: 403,
            }
          )
      )
    );

    const upload = renderHook(() => useFileUpload()).result.current;

    await expect(upload(file)).rejects.toThrow("Envio não autorizado");
  });
});
