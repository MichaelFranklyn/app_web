import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import { UPDATE_DAY_DEPARTURE_MUTATION } from "../../gql";
import { useDeparture } from "./useDeparture";

const DAY_ID = "day-1";

const updateMock = (input: Record<string, unknown>, ok = true) => ({
  request: {
    query: UPDATE_DAY_DEPARTURE_MUTATION,
    variables: { id: DAY_ID, input },
  },
  result: {
    data: {
      updateVisitScheduleDay: {
        __typename: "VisitScheduleDayResponse",
        status: ok,
        message: ok ? "Rota recalculada" : "Dia já encerrado",
        data: ok
          ? {
              __typename: "VisitScheduleDayType",
              id: DAY_ID,
              departureType: input.departureType,
              departureAddress: input.departureAddress ?? null,
            }
          : null,
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

const run = (mocks: unknown[], departureType = "HOME") => {
  const onOpenChange = vi.fn();
  const onChanged = vi.fn();
  const { result, rerender } = renderHook(
    ({ open, type }: { open: boolean; type: string }) =>
      useDeparture({
        open,
        onOpenChange,
        dayId: DAY_ID,
        departureType: type,
        onChanged,
      }),
    {
      wrapper: wrapper(mocks),
      initialProps: { open: true, type: departureType },
    }
  );
  return { result, rerender, onOpenChange, onChanged };
};

const endereco = {
  depStreet: "Rua das Flores",
  depNumber: "100",
  depNeighborhood: "Centro",
  depCity: "Salvador",
  depState: "BA",
  depCep: "40000-000",
};

describe("useDeparture", () => {
  it("abre no ponto de partida que o dia já tem", () => {
    expect(run([]).result.current.mode).toBe("home");
    expect(run([], "CUSTOM").result.current.mode).toBe("custom");
  });

  it("reabrir o modal esquece a escolha não salva", () => {
    // Trocar para "personalizado" e fechar sem salvar não pode deixar a tela
    // dizendo que o dia parte de outro lugar.
    const { result, rerender } = run([]);

    act(() => result.current.setMode("custom"));
    rerender({ open: false, type: "HOME" });
    rerender({ open: true, type: "HOME" });

    expect(result.current.mode).toBe("home");
  });

  it("partir de casa manda só o tipo — o endereço é o backend que sabe", async () => {
    const { result, onOpenChange, onChanged } = run([
      updateMock({ departureType: "HOME" }),
    ]);

    await act(() => result.current.applyHome());

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("endereço personalizado viaja como texto, para a rota geocodificar", async () => {
    const { result, onChanged } = run([
      updateMock({
        departureType: "CUSTOM",
        departureAddress: "Rua das Flores, 100, Centro, Salvador - BA",
      }),
    ]);

    await act(() => result.current.applyCustom(endereco));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it("endereço sem rua nem cidade não vai ao servidor", async () => {
    const { result, onChanged, onOpenChange } = run([]);

    await act(() => result.current.applyCustom({}));

    expect(onChanged).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("recusa do backend mantém o modal aberto", async () => {
    const { result, onChanged, onOpenChange } = run([
      updateMock({ departureType: "HOME" }, false),
    ]);

    await act(() => result.current.applyHome());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onChanged).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
