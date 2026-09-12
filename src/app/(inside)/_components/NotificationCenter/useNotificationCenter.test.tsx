import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { Toast } from "@/components/Toast";
import {
  MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION,
  MARK_NOTIFICATION_AS_READ_MUTATION,
  MY_NOTIFICATIONS_QUERY,
  MY_UNREAD_NOTIFICATIONS_COUNT_QUERY,
} from "../../_shared/notifications/gql";
import { Notification } from "../../_shared/notifications/interface";
import { useNotificationCenter } from "./useNotificationCenter";

const notification = (
  id: string,
  overrides: Partial<Notification> = {}
): Notification =>
  ({
    __typename: "NotificationType",
    id,
    severity: "INFO",
    category: "ORDER",
    title: `Aviso ${id}`,
    body: null,
    link: `/orders/${id}`,
    relatedEntityType: "order",
    relatedEntityId: id,
    isRead: false,
    readAt: null,
    createdAt: "2026-09-12T10:00:00Z",
    ...overrides,
  }) as Notification;

const countMock = (count: number) => ({
  request: { query: MY_UNREAD_NOTIFICATIONS_COUNT_QUERY },
  maxUsageCount: 10,
  result: {
    data: {
      myUnreadNotificationsCount: {
        __typename: "CountResponse",
        status: true,
        data: count,
      },
    },
  },
});

const listMock = (items: Notification[]) => ({
  request: {
    query: MY_NOTIFICATIONS_QUERY,
    variables: { input: { first: 20 } },
  },
  maxUsageCount: 10,
  result: {
    data: {
      my_notifications: {
        __typename: "NotificationConnection",
        edges: items.map((node) => ({
          __typename: "NotificationEdge",
          node,
        })),
        pageInfo: {
          __typename: "PageInfo",
          hasNextPage: false,
          endCursor: null,
        },
        totalCount: items.length,
      },
    },
  },
});

const readMock = (id: string, ok = true) => ({
  request: { query: MARK_NOTIFICATION_AS_READ_MUTATION, variables: { id } },
  result: {
    data: {
      markNotificationAsRead: {
        __typename: "NotificationResponse",
        status: ok,
        message: ok ? "ok" : "Notificação não encontrada",
        data: ok
          ? {
              __typename: "NotificationType",
              id,
              isRead: true,
              readAt: "2026-09-12T11:00:00Z",
            }
          : null,
      },
    },
  },
});

const readAllMock = (ok = true) => ({
  request: { query: MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION },
  result: {
    data: {
      markAllNotificationsAsRead: {
        __typename: "BaseResponse",
        status: ok,
        message: ok ? "ok" : "Erro",
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

/** O sino só busca a lista depois de aberto (`skip: !open`). */
const run = async (mocks: unknown[]) => {
  const { result } = renderHook(() => useNotificationCenter(), {
    wrapper: wrapper(mocks),
  });
  act(() => result.current.setOpen(true));
  return result;
};

const clickEvent = () =>
  ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }) as unknown as React.MouseEvent<HTMLButtonElement>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useNotificationCenter", () => {
  it("o sino mostra o que ainda não foi lido", async () => {
    const result = await run([countMock(3), listMock([notification("n1")])]);

    await waitFor(() => expect(result.current.unreadCount).toBe(3));
    await waitFor(() => expect(result.current.items).toHaveLength(1));
  });

  it("enquanto a lista não chega, o sino diz que está carregando", async () => {
    // Sem isso o dropdown abria afirmando "Sem notificações por enquanto."
    // antes mesmo de ter perguntado ao backend.
    const result = await run([countMock(1), listMock([notification("n1")])]);

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.isLoading).toBe(false);
  });

  it("clicar marca como lida e baixa o contador na hora", async () => {
    // Otimista primeiro: a linha e o badge reagem antes do backend responder.
    const result = await run([
      countMock(2),
      listMock([notification("n1")]),
      readMock("n1"),
    ]);
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    await waitFor(() => expect(result.current.unreadCount).toBe(2));

    act(() => result.current.handleItemClick(result.current.items[0]));

    expect(result.current.items[0].isRead).toBe(true);
    expect(result.current.unreadCount).toBe(1);
    expect(push).toHaveBeenCalledWith("/orders/n1");
  });

  it("falha ao marcar devolve a linha e o contador ao que eram", async () => {
    const result = await run([
      countMock(2),
      listMock([notification("n1")]),
      readMock("n1", false),
    ]);
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    await waitFor(() => expect(result.current.unreadCount).toBe(2));

    act(() => result.current.handleItemClick(result.current.items[0]));

    await waitFor(() => expect(result.current.items[0].isRead).toBe(false));
    expect(result.current.unreadCount).toBe(2);
  });

  it("aviso já lido só navega, sem mexer no contador", async () => {
    const result = await run([
      countMock(1),
      listMock([notification("n1", { isRead: true })]),
    ]);
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    await waitFor(() => expect(result.current.unreadCount).toBe(1));

    act(() => result.current.handleItemClick(result.current.items[0]));

    expect(result.current.unreadCount).toBe(1);
    expect(push).toHaveBeenCalledWith("/orders/n1");
  });

  it("insight leva para a central, onde o número é o de hoje", async () => {
    // O aviso do sino é a foto do dia em que o job rodou.
    const result = await run([
      countMock(1),
      listMock([
        notification("n1", { category: "INSIGHT", link: "/clients/9" }),
      ]),
      readMock("n1"),
    ]);
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => result.current.handleItemClick(result.current.items[0]));

    expect(push).toHaveBeenCalledWith("/insights");
  });

  it("aviso sem destino não navega para lugar nenhum", async () => {
    const result = await run([
      countMock(1),
      listMock([notification("n1", { link: null })]),
      readMock("n1"),
    ]);
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => result.current.handleItemClick(result.current.items[0]));

    expect(push).not.toHaveBeenCalled();
    expect(result.current.items[0].isRead).toBe(true);
  });

  it("marcar todas zera o sino de uma vez", async () => {
    const result = await run([
      countMock(2),
      listMock([notification("n1"), notification("n2")]),
      readAllMock(),
    ]);
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    await waitFor(() => expect(result.current.unreadCount).toBe(2));

    act(() => result.current.handleMarkAllRead(clickEvent()));

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.items.every((item) => item.isRead)).toBe(true);
  });

  it("falha ao marcar todas devolve a lista como estava", async () => {
    const result = await run([
      countMock(2),
      listMock([notification("n1"), notification("n2")]),
      readAllMock(false),
    ]);
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    await waitFor(() => expect(result.current.unreadCount).toBe(2));

    act(() => result.current.handleMarkAllRead(clickEvent()));

    await waitFor(() =>
      expect(result.current.items.every((item) => !item.isRead)).toBe(true)
    );
    expect(result.current.unreadCount).toBe(2);
  });
});
