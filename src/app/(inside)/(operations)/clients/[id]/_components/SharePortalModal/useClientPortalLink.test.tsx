import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { Toast } from "@/components/Toast";
import {
  CLIENT_PORTAL_LINK_QUERY,
  ISSUE_CLIENT_PORTAL_LINK_MUTATION,
  REVOKE_CLIENT_PORTAL_LINK_MUTATION,
} from "./gql";
import { useClientPortalLink } from "./useClientPortalLink";

const CLIENT = "cc1";

const link = (url: string | null) =>
  url
    ? {
        __typename: "ClientPortalLinkType",
        url,
        expiresAt: "2026-12-31",
        lastAccessedAt: null,
        createdAt: "2026-09-12",
      }
    : null;

const linkQueryMock = (url: string | null) => ({
  request: {
    query: CLIENT_PORTAL_LINK_QUERY,
    variables: { companyClientId: CLIENT },
  },
  maxUsageCount: 5,
  result: {
    data: {
      clientPortalLink: {
        __typename: "ClientPortalLinkResponse",
        status: true,
        data: link(url),
      },
    },
  },
});

const issueMock = (ok = true) => ({
  request: {
    query: ISSUE_CLIENT_PORTAL_LINK_MUTATION,
    variables: { companyClientId: CLIENT },
  },
  result: {
    data: {
      issueClientPortalLink: {
        __typename: "ClientPortalLinkResponse",
        status: ok,
        message: ok ? "Link gerado" : "Cliente sem e-mail",
        data: ok ? link("https://girus.app/p/token-novo") : null,
      },
    },
  },
});

const revokeMock = (ok = true) => ({
  request: {
    query: REVOKE_CLIENT_PORTAL_LINK_MUTATION,
    variables: { companyClientId: CLIENT },
  },
  result: {
    data: {
      revokeClientPortalLink: {
        __typename: "BaseResponse",
        status: ok,
        message: ok ? "Link cancelado" : "Nenhum link ativo",
      },
    },
  },
});

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Toast.ToastProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
      <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
    </Toast.ToastProvider>
  );
  return Wrapper;
};

const run = (mocks: unknown[]) =>
  renderHook(() => useClientPortalLink(CLIENT), { wrapper: wrapper(mocks) })
    .result;

describe("useClientPortalLink", () => {
  it("só consulta quando alguém abre o compartilhamento", async () => {
    // Quase nenhuma abertura da ficha acaba em compartilhamento: uma query a
    // mais em toda visita pagaria por um botão que raramente é clicado.
    const result = run([linkQueryMock("https://girus.app/p/antigo")]);

    expect(result.current.activeLink).toBeNull();

    act(() => result.current.load());

    await waitFor(() =>
      expect(result.current.activeLink?.url).toBe("https://girus.app/p/antigo")
    );
  });

  it("gerar o link mostra a URL, que só existe nesta tela", async () => {
    // O backend guarda o hash e devolve a URL uma vez só, na emissão.
    const result = run([issueMock(), linkQueryMock("https://girus.app/p/x")]);

    await act(() => result.current.issue());

    await waitFor(() =>
      expect(result.current.issuedUrl).toBe("https://girus.app/p/token-novo")
    );
  });

  it("recarregar o estado esquece a URL mostrada", async () => {
    // Ela não volta do servidor: mantê-la na tela depois daria a impressão de
    // que dá para copiar de novo mais tarde.
    const result = run([
      issueMock(),
      linkQueryMock("https://girus.app/p/x"),
      linkQueryMock("https://girus.app/p/x"),
    ]);
    await act(() => result.current.issue());
    await waitFor(() => expect(result.current.issuedUrl).not.toBeNull());

    act(() => result.current.load());

    expect(result.current.issuedUrl).toBeNull();
  });

  it("cancelar o link apaga o que estava na tela", async () => {
    const result = run([
      issueMock(),
      linkQueryMock("https://girus.app/p/x"),
      revokeMock(),
      linkQueryMock(null),
    ]);
    await act(() => result.current.issue());
    await waitFor(() => expect(result.current.issuedUrl).not.toBeNull());

    await act(() => result.current.revoke());

    await waitFor(() => expect(result.current.issuedUrl).toBeNull());
  });

  it("recusa ao gerar não deixa URL nenhuma na tela", async () => {
    const result = run([issueMock(false)]);

    await act(() => result.current.issue());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.issuedUrl).toBeNull();
  });

  it("cliente sem link ativo simplesmente não tem link", async () => {
    const result = run([linkQueryMock(null)]);

    act(() => result.current.load());

    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.activeLink).toBeNull();
  });
});
