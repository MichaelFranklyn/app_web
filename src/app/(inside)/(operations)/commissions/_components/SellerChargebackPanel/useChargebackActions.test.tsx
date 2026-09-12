import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import { toIsoDate } from "@/utils/format/date";
import {
  MARK_SELLER_CHARGEBACK_REFUNDED_MUTATION,
  MARK_SELLER_CHARGEBACK_SETTLED_MUTATION,
  SCHEDULE_SELLER_CHARGEBACK_MUTATION,
} from "../../gql";
import { useChargebackActions } from "./useChargebackActions";

const IDS = ["i1", "i2"];

const okResult = (field: string, message: string) => ({
  data: {
    [field]: { __typename: "BaseResponse", status: true, message },
  },
});

const scheduleMock = (month: string | null) => ({
  request: {
    query: SCHEDULE_SELLER_CHARGEBACK_MUTATION,
    variables: { installmentIds: IDS, month },
  },
  result: okResult("scheduleSellerChargeback", "ok"),
});

const settledMock = (settledAt: string) => ({
  request: {
    query: MARK_SELLER_CHARGEBACK_SETTLED_MUTATION,
    variables: { installmentIds: IDS, settledAt },
  },
  result: okResult("markSellerChargebackSettled", "ok"),
});

const refundedMock = () => ({
  request: {
    query: MARK_SELLER_CHARGEBACK_REFUNDED_MUTATION,
    variables: { installmentIds: IDS },
  },
  result: okResult("markSellerChargebackRefunded", "ok"),
});

const recusa = {
  request: {
    query: SCHEDULE_SELLER_CHARGEBACK_MUTATION,
    variables: { installmentIds: IDS, month: "2026-10-01" },
  },
  result: {
    data: {
      scheduleSellerChargeback: {
        __typename: "BaseResponse",
        status: false,
        message: "Parcela já descontada.",
      },
    },
  },
};

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Toast.ToastProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
      <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
    </Toast.ToastProvider>
  );
  return Wrapper;
};

const run = (mocks: unknown[]) => {
  const onChanged = vi.fn();
  const { result } = renderHook(() => useChargebackActions(onChanged), {
    wrapper: wrapper(mocks),
  });
  return { result, onChanged };
};

describe("useChargebackActions", () => {
  it("agendar o desconto escolhe o FECHAMENTO, não o dia", async () => {
    // O estorno sai no fechamento do mês: o backend recebe o dia 1º.
    const { result, onChanged } = run([scheduleMock("2026-10-01")]);

    await act(() => result.current.scheduleTo(IDS, { year: 2026, month: 10 }));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it("sem mês, o estorno volta para a fila", async () => {
    const { result, onChanged } = run([scheduleMock(null)]);

    await act(() => result.current.scheduleTo(IDS, null));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it("registrar o desconto carimba o dia de hoje", async () => {
    // A data do desconto é a de hoje: o escritório registra no dia em que fez.
    const hoje = toIsoDate(new Date())!;
    const { result, onChanged } = run([settledMock(hoje)]);

    await act(() => result.current.markSettled(IDS));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it("registrar a devolução não pede data — ela é o próprio fato", async () => {
    const { result, onChanged } = run([refundedMock()]);

    await act(() => result.current.markRefunded(IDS));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it("recusa do backend não recarrega a lista como se tivesse dado certo", async () => {
    const { result, onChanged } = run([recusa]);

    await act(() => result.current.scheduleTo(IDS, { year: 2026, month: 10 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onChanged).not.toHaveBeenCalled();
  });
});
