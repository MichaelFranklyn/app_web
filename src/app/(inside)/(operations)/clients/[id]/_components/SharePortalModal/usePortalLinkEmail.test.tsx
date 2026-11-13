import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import {
  PORTAL_LINK_CONTACTS_QUERY,
  SEND_CLIENT_PORTAL_LINK_EMAIL_MUTATION,
} from "./gql";
import { usePortalLinkEmail } from "./usePortalLinkEmail";

const CC = "cc1";
const CLIENT = "cl1";
const URL = "https://itinus.app/p/token-novo";

const contact = (id: string, over: Record<string, unknown> = {}) => ({
  __typename: "ClientContactType",
  id,
  name: `Contato ${id}`,
  email: `${id}@loja.com.br`,
  isPrimary: false,
  isActive: true,
  ...over,
});

const contactsMock = (nodes: ReturnType<typeof contact>[]) => ({
  request: {
    query: PORTAL_LINK_CONTACTS_QUERY,
    variables: { clientId: CLIENT, input: { first: 200 } },
  },
  maxUsageCount: 5,
  result: {
    data: {
      clientContacts: {
        __typename: "ClientContactTypeConnection",
        edges: nodes.map((node) => ({
          __typename: "ClientContactTypeEdge",
          node,
        })),
        totalCount: nodes.length,
      },
    },
  },
});

const sendMock = (contactId: string, ok = true, onCall = vi.fn()) => ({
  request: {
    query: SEND_CLIENT_PORTAL_LINK_EMAIL_MUTATION,
    variables: { companyClientId: CC, input: { contactId, url: URL } },
  },
  result: () => {
    onCall();
    return {
      data: {
        sendClientPortalLinkEmail: {
          __typename: "BaseResponse",
          status: ok,
          message: ok ? "Link enviado." : "Este link não vale mais.",
        },
      },
    };
  },
});

const run = (mocks: unknown[], enabled = true) =>
  renderHook(() => usePortalLinkEmail(CC, CLIENT, enabled), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Toast.ToastProvider>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
        <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
      </Toast.ToastProvider>
    ),
  }).result;

describe("usePortalLinkEmail", () => {
  it("lista só quem tem email e está ativo, o principal primeiro", async () => {
    const result = run([
      contactsMock([
        contact("a"),
        contact("b", { email: "  " }),
        contact("c", { isActive: false }),
        contact("d", { isPrimary: true }),
      ]),
    ]);

    await waitFor(() => expect(result.current.targets).toHaveLength(2));
    expect(result.current.targets.map((c) => c.id)).toEqual(["d", "a"]);
  });

  it("sem link na tela, não busca contato nenhum", () => {
    const result = run([], false);
    expect(result.current.loading).toBe(false);
    expect(result.current.targets).toEqual([]);
  });

  it("manda a URL que está na tela para o contato escolhido", async () => {
    const called = vi.fn();
    const result = run([
      contactsMock([contact("a")]),
      sendMock("a", true, called),
    ]);
    await waitFor(() => expect(result.current.targets).toHaveLength(1));

    await act(() => result.current.send("a", URL));

    expect(called).toHaveBeenCalledTimes(1);
    expect(result.current.isSending).toBe(false);
  });

  it("recusa do backend não quebra o hook", async () => {
    const result = run([contactsMock([contact("a")]), sendMock("a", false)]);
    await waitFor(() => expect(result.current.targets).toHaveLength(1));

    await act(() => result.current.send("a", URL));

    expect(result.current.isSending).toBe(false);
  });
});
