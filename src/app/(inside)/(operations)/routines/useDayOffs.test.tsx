import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import {
  MARK_SELLER_DAY_OFF_MUTATION,
  SELLER_DAY_OFFS_QUERY,
  UNMARK_SELLER_DAY_OFF_MUTATION,
} from "./gql";
import { useDayOffs } from "./useDayOffs";

const WEEK = "2026-09-07";
const SUNDAY = "2026-09-13";

const listMock = (
  dayOffs: { id: string; date: string; reason: string | null }[],
  sellerId: string | null = null
) => ({
  request: {
    query: SELLER_DAY_OFFS_QUERY,
    variables: { sellerId, from: WEEK, to: SUNDAY },
  },
  maxUsageCount: 10,
  result: {
    data: {
      seller_day_offs: dayOffs.map((dayOff) => ({
        __typename: "SellerDayOffType",
        ...dayOff,
      })),
    },
  },
});

const markMock = (
  date: string,
  reason: string | null,
  ok = true,
  sellerId: string | null = null
) => ({
  request: {
    query: MARK_SELLER_DAY_OFF_MUTATION,
    variables: { sellerId, date, reason },
  },
  result: {
    data: {
      markSellerDayOff: {
        __typename: "DayOffResponse",
        status: ok,
        message: ok
          ? "2 visitas remarcadas, 1 sem vaga nesta semana"
          : "Dia já passou",
        data: ok
          ? {
              __typename: "DayOffResult",
              rescheduled: 2,
              released: 1,
              dayOff: {
                __typename: "SellerDayOffType",
                id: "d1",
                date,
                reason,
              },
            }
          : null,
      },
    },
  },
});

const unmarkMock = (date: string) => ({
  request: {
    query: UNMARK_SELLER_DAY_OFF_MUTATION,
    variables: { sellerId: null, date },
  },
  result: {
    data: {
      unmarkSellerDayOff: {
        __typename: "DayOffResponse",
        status: true,
        message: "Dia liberado",
        data: { __typename: "SellerDayOffType", id: "d1", date },
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

const run = (mocks: unknown[], sellerId: string | null = null) => {
  const onChanged = vi.fn();
  const { result } = renderHook(
    () => useDayOffs({ weekStart: WEEK, sellerId, onChanged }),
    { wrapper: wrapper(mocks) }
  );
  return { result, onChanged };
};

describe("useDayOffs", () => {
  it("lê a semana inteira, de segunda a domingo", async () => {
    const { result } = run([
      listMock([{ id: "d1", date: "2026-09-09", reason: "Feriado municipal" }]),
    ]);

    await waitFor(() =>
      expect(result.current.dayOffDates.has("2026-09-09")).toBe(true)
    );
    expect(result.current.byDate.get("2026-09-09")?.reason).toBe(
      "Feriado municipal"
    );
  });

  it("marcar o dia recarrega a semana em vez de adivinhar o resultado", async () => {
    // Marcar mexe na semana inteira: as paradas trocam de dia e só o backend
    // sabe quantas couberam.
    const { result, onChanged } = run([
      listMock([]),
      markMock("2026-09-09", "Médico"),
      listMock([{ id: "d1", date: "2026-09-09", reason: "Médico" }]),
    ]);

    await waitFor(() => expect(result.current.dayOffDates.size).toBe(0));
    await act(() => result.current.mark("2026-09-09", "Médico"));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it("motivo em branco vira 'sem motivo', não string vazia", async () => {
    const { result, onChanged } = run([
      listMock([]),
      markMock("2026-09-09", null),
    ]);

    await act(() => result.current.mark("2026-09-09", ""));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it("desmarcar devolve o dia ao trabalho", async () => {
    const { result, onChanged } = run([
      listMock([{ id: "d1", date: "2026-09-09", reason: null }]),
      unmarkMock("2026-09-09"),
      listMock([]),
    ]);

    await waitFor(() => expect(result.current.dayOffDates.size).toBe(1));
    await act(() => result.current.unmark("2026-09-09"));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it("recusa do backend não avisa a tela de que algo mudou", async () => {
    const { result, onChanged } = run([
      listMock([]),
      markMock("2026-09-01", null, false),
    ]);

    await act(() => result.current.mark("2026-09-01"));

    expect(onChanged).not.toHaveBeenCalled();
  });

  it("o gestor marca a folga do vendedor que está vendo", async () => {
    const { result, onChanged } = run(
      [
        listMock([], "s2"),
        markMock("2026-09-09", null, true, "s2"),
        listMock([{ id: "d1", date: "2026-09-09", reason: null }], "s2"),
      ],
      "s2"
    );

    await act(() => result.current.mark("2026-09-09"));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });
});
