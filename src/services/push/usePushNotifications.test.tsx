import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { subscribe, unsubscribe, getSubscription, isPushSupported } = vi.hoisted(
  () => ({
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    getSubscription: vi.fn(),
    isPushSupported: vi.fn(() => true),
  })
);

vi.mock("./browser", () => ({
  subscribe,
  unsubscribe,
  getSubscription,
  isPushSupported,
  isInstalledApp: () => false,
}));

import { Toast } from "@/components/Toast";
import {
  PUSH_PUBLIC_KEY_QUERY,
  REGISTER_PUSH_SUBSCRIPTION_MUTATION,
  REMOVE_PUSH_SUBSCRIPTION_MUTATION,
  SEND_TEST_PUSH_MUTATION,
} from "./gql";
import { usePushNotifications } from "./usePushNotifications";

const INSCRICAO = {
  endpoint: "https://fcm/abc",
  p256dh: "p",
  auth: "a",
};

const keyMock = (key: string) => ({
  request: { query: PUSH_PUBLIC_KEY_QUERY },
  maxUsageCount: 10,
  result: {
    data: {
      pushPublicKey: {
        __typename: "PushPublicKeyResponse",
        status: true,
        data: key,
      },
    },
  },
});

const registerMock = (deviceLabel: string) => ({
  request: {
    query: REGISTER_PUSH_SUBSCRIPTION_MUTATION,
    variables: { input: { ...INSCRICAO, deviceLabel } },
  },
  result: {
    data: {
      registerPushSubscription: {
        __typename: "BaseResponse",
        status: true,
        message: "ok",
      },
    },
  },
});

const testPushMock = (status = true) => ({
  request: { query: SEND_TEST_PUSH_MUTATION },
  maxUsageCount: 5,
  result: {
    data: {
      sendTestPush: {
        __typename: "BaseResponse",
        status,
        message: "Aviso de teste enviado para 1 aparelho(s)",
      },
    },
  },
});

const removeMock = () => ({
  request: {
    query: REMOVE_PUSH_SUBSCRIPTION_MUTATION,
    variables: { endpoint: INSCRICAO.endpoint },
  },
  result: {
    data: {
      removePushSubscription: {
        __typename: "BaseResponse",
        status: true,
        message: "ok",
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

const permitir = (estado: NotificationPermission) => {
  vi.stubGlobal("Notification", { permission: estado });
};

beforeEach(() => {
  vi.clearAllMocks();
  getSubscription.mockResolvedValue(null);
  isPushSupported.mockReturnValue(true);
  permitir("default");
  // O rótulo do aparelho sai do user agent; fixado para a variável do mock bater.
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36"
  );
});

describe("usePushNotifications", () => {
  it("sem chave no servidor, o recurso nem é oferecido", async () => {
    const { result } = renderHook(() => usePushNotifications(), {
      wrapper: wrapper([keyMock("")]),
    });
    await waitFor(() => expect(result.current.status).toBe("disabled"));
  });

  it("query que falha não deixa a tela carregando para sempre", async () => {
    // Aconteceu de verdade: com a API fora do ar (e aconteceria igual com um
    // backend mais velho, que ainda não conhece `pushPublicKey`), o card ficava
    // no esqueleto sem fim. Sem resposta não há push neste ambiente.
    const { result } = renderHook(() => usePushNotifications(), {
      wrapper: wrapper([
        {
          request: { query: PUSH_PUBLIC_KEY_QUERY },
          error: new Error("Failed to fetch"),
        },
      ]),
    });

    await waitFor(() => expect(result.current.status).toBe("disabled"));
  });

  it("navegador sem suporte não vira botão", async () => {
    isPushSupported.mockReturnValue(false);
    const { result } = renderHook(() => usePushNotifications(), {
      wrapper: wrapper([keyMock("chave")]),
    });
    await waitFor(() => expect(result.current.status).toBe("unsupported"));
  });

  it("aparelho já inscrito abre como ligado", async () => {
    permitir("granted");
    getSubscription.mockResolvedValue({ endpoint: INSCRICAO.endpoint });
    const { result } = renderHook(() => usePushNotifications(), {
      wrapper: wrapper([keyMock("chave")]),
    });
    await waitFor(() => expect(result.current.status).toBe("on"));
  });

  it("ativar inscreve o aparelho e registra no backend", async () => {
    subscribe.mockResolvedValue(INSCRICAO);
    const { result } = renderHook(() => usePushNotifications(), {
      wrapper: wrapper([
        keyMock("chave"),
        registerMock("Chrome no Android"),
        testPushMock(),
      ]),
    });
    await waitFor(() => expect(result.current.status).toBe("off"));

    await act(async () => {
      await result.current.enable();
    });

    expect(subscribe).toHaveBeenCalledWith("chave");
    await waitFor(() => expect(result.current.status).toBe("on"));
  });

  it("o aviso de teste que não sai não reprova a ativação", async () => {
    // Estar inscrito não prova que o aviso chega; mas se o teste falhar, quem
    // acabou de ativar não pode ver "erro ao ativar" — a ativação deu certo.
    subscribe.mockResolvedValue(INSCRICAO);
    const { result } = renderHook(() => usePushNotifications(), {
      wrapper: wrapper([
        keyMock("chave"),
        registerMock("Chrome no Android"),
        {
          request: { query: SEND_TEST_PUSH_MUTATION },
          error: new Error("backend fora"),
        },
      ]),
    });
    await waitFor(() => expect(result.current.status).toBe("off"));

    await act(async () => {
      await result.current.enable();
    });

    await waitFor(() => expect(result.current.status).toBe("on"));
  });

  it("negar a permissão não vira 'ligado' — vira 'bloqueado'", async () => {
    // `subscribe` devolve null quando o usuário responde "Bloquear"; o navegador
    // não pergunta de novo, e a tela precisa explicar como desfazer.
    subscribe.mockImplementation(async () => {
      permitir("denied");
      return null;
    });
    const { result } = renderHook(() => usePushNotifications(), {
      wrapper: wrapper([keyMock("chave")]),
    });
    await waitFor(() => expect(result.current.status).toBe("off"));

    await act(async () => {
      await result.current.enable();
    });

    await waitFor(() => expect(result.current.status).toBe("blocked"));
  });

  it("desligar descarta a inscrição dos dois lados", async () => {
    permitir("granted");
    getSubscription.mockResolvedValue({ endpoint: INSCRICAO.endpoint });
    // Desinscrever muda o que o NAVEGADOR responde daí em diante — o mock
    // precisa acompanhar, senão a remedição (que existe para o caso do service
    // worker registrar tarde) acha a inscrição de novo e devolve "ligado".
    unsubscribe.mockImplementation(async () => {
      getSubscription.mockResolvedValue(null);
      return INSCRICAO.endpoint;
    });
    const { result } = renderHook(() => usePushNotifications(), {
      wrapper: wrapper([keyMock("chave"), removeMock()]),
    });
    await waitFor(() => expect(result.current.status).toBe("on"));

    await act(async () => {
      await result.current.disable();
    });

    expect(unsubscribe).toHaveBeenCalled();
    await waitFor(() => expect(result.current.status).toBe("off"));
  });

  it("desligar sem inscrição no navegador não chama o backend", async () => {
    // Acontece com quem limpou os dados do site e volta aqui para desligar.
    permitir("granted");
    getSubscription.mockResolvedValue({ endpoint: INSCRICAO.endpoint });
    unsubscribe.mockImplementation(async () => {
      getSubscription.mockResolvedValue(null);
      return null;
    });
    const { result } = renderHook(() => usePushNotifications(), {
      wrapper: wrapper([keyMock("chave")]),
    });
    await waitFor(() => expect(result.current.status).toBe("on"));

    await act(async () => {
      await result.current.disable();
    });

    await waitFor(() => expect(result.current.status).toBe("off"));
  });
});
