import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import { ProfileScheduleConfig, ProfileSeller } from "../interface";
import {
  buildCreateInputFromOperational,
  CREATE_SCHEDULE_CONFIG_MUTATION,
  DEFAULT_CONFIG_FORM,
  UPDATE_SCHEDULE_CONFIG_MUTATION,
} from "./routineConfig";
import { useRoutineCardForm } from "./useRoutineCardForm";

/** Mesmos padrões operacionais com que o card nasce sem configuração. */
const DEFAULT_OPERATIONAL = {
  maxVisitsPerDay: DEFAULT_CONFIG_FORM.maxVisitsPerDay,
  workDays: [...DEFAULT_CONFIG_FORM.workDays],
  workStartTime: DEFAULT_CONFIG_FORM.workStartTime,
  workEndTime: DEFAULT_CONFIG_FORM.workEndTime,
  isRemoteContactEnabled: DEFAULT_CONFIG_FORM.isRemoteContactEnabled,
  maxRemoteContactsPerDay: DEFAULT_CONFIG_FORM.maxRemoteContactsPerDay,
  remoteContactIntervalPct: DEFAULT_CONFIG_FORM.remoteContactIntervalPct,
  avgVisitDurationMin: DEFAULT_CONFIG_FORM.avgVisitDurationMin,
  isRescheduleSameWeek: DEFAULT_CONFIG_FORM.isRescheduleSameWeek,
  maxRescheduleAttempts: DEFAULT_CONFIG_FORM.maxRescheduleAttempts,
};

const SELLER = "s1";

const config = (
  overrides: Partial<ProfileScheduleConfig> = {}
): ProfileScheduleConfig => ({
  id: "cfg1",
  maxVisitsPerDay: 8,
  workDays: [1, 2, 3, 4, 5],
  workStartTime: "08:00",
  workEndTime: "18:00",
  isRemoteContactEnabled: true,
  maxRemoteContactsPerDay: 5,
  remoteContactIntervalPct: 50,
  avgVisitDurationMin: 45,
  isRescheduleSameWeek: true,
  maxRescheduleAttempts: 2,
  ...overrides,
});

const seller = (scheduleConfig: ProfileScheduleConfig | null): ProfileSeller =>
  ({ id: SELLER, name: "Rafael", scheduleConfig }) as ProfileSeller;

const savedNode = {
  __typename: "VisitScheduleConfigType",
  id: "cfg1",
  sellerId: SELLER,
  maxVisitsPerDay: 6,
  workDays: [1, 2, 3, 4, 5],
  workStartTime: "08:00",
  workEndTime: "18:00",
  isRemoteContactEnabled: true,
  maxRemoteContactsPerDay: 5,
  remoteContactIntervalPct: 50,
  avgVisitDurationMin: 45,
  isRescheduleSameWeek: true,
  maxRescheduleAttempts: 2,
  penaltyScorePerMiss: DEFAULT_CONFIG_FORM.penaltyScorePerMiss,
  priorityWeights: DEFAULT_CONFIG_FORM.priorityWeights,
  seller: {
    __typename: "SellerType",
    id: SELLER,
    user: { __typename: "UserType", name: "Rafael" },
  },
};

const updateMock = (input: Record<string, unknown>, ok = true) => ({
  request: {
    query: UPDATE_SCHEDULE_CONFIG_MUTATION,
    variables: { id: "cfg1", input },
  },
  result: {
    data: {
      updateScheduleConfig: {
        __typename: "VisitScheduleConfigResponse",
        status: ok,
        message: ok ? "Rotina atualizada" : "Horário inválido",
        data: ok ? savedNode : null,
      },
    },
  },
});

/** Os padrões do sistema, que é o que o primeiro "Salvar" manda. */
const createMock = (form = DEFAULT_OPERATIONAL) => ({
  request: {
    query: CREATE_SCHEDULE_CONFIG_MUTATION,
    variables: { input: buildCreateInputFromOperational(form, SELLER) },
  },
  result: {
    data: {
      createScheduleConfig: {
        __typename: "VisitScheduleConfigResponse",
        status: true,
        message: "Rotina configurada",
        data: savedNode,
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

const run = (
  mocks: unknown[] = [],
  scheduleConfig: ProfileScheduleConfig | null = config()
) => {
  const onSaved = vi.fn();
  const { result } = renderHook(
    () => useRoutineCardForm({ seller: seller(scheduleConfig), onSaved }),
    { wrapper: wrapper(mocks) }
  );
  return { result, onSaved };
};

describe("useRoutineCardForm", () => {
  it("vendedor sem rotina configurada abre nos padrões do sistema", () => {
    const { result } = run([], null);

    expect(result.current.config).toBeNull();
    expect(result.current.form.workDays.length).toBeGreaterThan(0);
    // Sem config, o primeiro "Salvar" cria — então há sempre o que salvar.
    expect(result.current.isDirty).toBe(true);
  });

  it("com rotina, o formulário abre com o que está valendo", () => {
    const { result } = run([], config({ maxVisitsPerDay: 8 }));

    expect(result.current.form.maxVisitsPerDay).toBe(8);
    expect(result.current.isDirty).toBe(false);
  });

  it("o primeiro salvar cria a configuração do vendedor", async () => {
    const { result, onSaved } = run([createMock()], null);

    act(() => result.current.startEditing());
    await act(() => result.current.save());

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(result.current.isEditing).toBe(false);
  });

  it("com configuração, manda só o que mudou", async () => {
    // Reenviar tudo sobrescreveria o que outra pessoa ajustou noutra aba.
    const { result, onSaved } = run([updateMock({ maxVisitsPerDay: 6 })]);

    act(() => result.current.patch({ maxVisitsPerDay: 6 }));
    expect(result.current.isDirty).toBe(true);

    await act(() => result.current.save());

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("salvar sem ter mudado nada só fecha a edição", async () => {
    // Sem mock de mutation: se ela fosse chamada, o teste falharia.
    const { result, onSaved } = run([]);

    act(() => result.current.startEditing());
    await act(() => result.current.save());

    expect(result.current.isEditing).toBe(false);
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("semana sem nenhum dia de trabalho é recusada antes de salvar", async () => {
    // Salvar isso pararia a geração de visitas em silêncio.
    const { result, onSaved } = run([]);

    act(() => result.current.patch({ workDays: [] }));
    await act(() => result.current.save());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("cancelar devolve o formulário ao que estava salvo", () => {
    const { result } = run([], config({ maxVisitsPerDay: 8 }));

    act(() => result.current.startEditing());
    act(() => result.current.patch({ maxVisitsPerDay: 2 }));
    act(() => result.current.cancelEditing());

    expect(result.current.form.maxVisitsPerDay).toBe(8);
    expect(result.current.isEditing).toBe(false);
  });

  it("recusa do backend mantém a edição aberta", async () => {
    const { result, onSaved } = run([
      updateMock({ maxVisitsPerDay: 6 }, false),
    ]);

    act(() => result.current.startEditing());
    act(() => result.current.patch({ maxVisitsPerDay: 6 }));
    await act(() => result.current.save());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isEditing).toBe(true);
    expect(onSaved).not.toHaveBeenCalled();
  });
});
