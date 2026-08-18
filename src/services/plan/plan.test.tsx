import { MockedProvider } from "@apollo/client/testing/react";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { ComponentProps, ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { FeatureGate } from "@/components/FeatureGate";
import { PlanLimitGate } from "@/components/PlanLimitGate";
import { MY_PLAN_QUERY } from "./gql";
import { PlanProvider, useFeature, usePlan } from "./PlanProvider";
import { limitReachedMessage, usePlanLimit } from "./usePlanLimit";

type Mocks = ComponentProps<typeof MockedProvider>["mocks"];

const planMock = (used: number, limit: number | null) => ({
  request: { query: MY_PLAN_QUERY },
  result: {
    data: {
      myPlan: {
        __typename: "MyPlanTypeDataResponse",
        data: {
          __typename: "MyPlanType",
          code: "basic",
          label: "Básico",
          features: ["COMMISSIONS"],
          limits: [
            {
              __typename: "PlanLimitUsageType",
              key: "CLIENTS",
              label: "clientes",
              limit,
              used,
              isAtLimit: limit !== null && used >= limit,
            },
          ],
        },
      },
    },
  },
  maxUsageCount: 10,
});

const apollo =
  (mocks: Mocks) =>
  // eslint-disable-next-line react/display-name -- wrapper de teste
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

const withPlan =
  (features: Parameters<typeof PlanProvider>[0]["plan"]["features"]) =>
  // eslint-disable-next-line react/display-name -- wrapper de teste
  ({ children }: { children: ReactNode }) => (
    <PlanProvider plan={{ code: "basic", label: "Básico", features }}>
      {children}
    </PlanProvider>
  );

describe("usePlan", () => {
  it("responde pelo que a empresa contratou", () => {
    const { result } = renderHook(() => usePlan(), {
      wrapper: withPlan(["COMMISSIONS"]),
    });
    expect(result.current.hasFeature("COMMISSIONS")).toBe(true);
    expect(result.current.hasFeature("ROUTINES")).toBe(false);
  });

  it("useFeature é o atalho do caso comum", () => {
    const { result } = renderHook(() => useFeature("ROUTINES"), {
      wrapper: withPlan(["COMMISSIONS"]),
    });
    expect(result.current).toBe(false);
  });

  it("estoura fora do provider, em vez de liberar tudo em silêncio", () => {
    // Um contexto ausente que devolvesse "tem tudo" transformaria erro de
    // montagem em recurso liberado — o oposto do que este serviço existe para
    // fazer.
    expect(() => renderHook(() => usePlan())).toThrow(/PlanProvider/);
  });
});

describe("usePlanLimit", () => {
  it("marca o teto atingido a partir da resposta do backend", async () => {
    const { result } = renderHook(() => usePlanLimit("CLIENTS"), {
      wrapper: apollo([planMock(300, 300)]),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAtLimit).toBe(true);
  });

  it("abaixo do teto não bloqueia", async () => {
    const { result } = renderHook(() => usePlanLimit("CLIENTS"), {
      wrapper: apollo([planMock(2, 300)]),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAtLimit).toBe(false);
  });

  it("enquanto carrega, não bloqueia", () => {
    // Bloquear por precaução deixaria o dono da conta diante de um botão morto
    // sem explicação — e quem recusa de verdade é a mutation.
    const { result } = renderHook(() => usePlanLimit("CLIENTS"), {
      wrapper: apollo([planMock(300, 300)]),
    });
    expect(result.current.isAtLimit).toBe(false);
  });

  it("teto ausente na resposta não inventa bloqueio", async () => {
    const { result } = renderHook(() => usePlanLimit("FACTORIES"), {
      wrapper: apollo([planMock(300, 300)]),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.usage).toBeNull();
    expect(result.current.isAtLimit).toBe(false);
  });
});

describe("limitReachedMessage", () => {
  it("diz o teto e o caminho", () => {
    const message = limitReachedMessage({
      key: "SELLERS",
      label: "vendedores",
      limit: 3,
      used: 3,
      isAtLimit: true,
    });
    expect(message).toContain("até 3 vendedores");
    expect(message).toContain("suporte");
  });

  it("sem teto não tem frase", () => {
    expect(
      limitReachedMessage({
        key: "SELLERS",
        label: "vendedores",
        limit: null,
        used: 9,
        isAtLimit: false,
      })
    ).toBe("");
  });
});

describe("PlanLimitGate", () => {
  it("deixa o botão passar quando ainda cabe", async () => {
    render(
      <MockedProvider mocks={[planMock(2, 300)]}>
        <PlanLimitGate limit="CLIENTS">
          <button>Novo Cliente</button>
        </PlanLimitGate>
      </MockedProvider>
    );
    const button = await screen.findByRole("button", { name: "Novo Cliente" });
    expect(button.closest("[aria-disabled]")).toBeNull();
  });

  it("neutraliza o botão no teto, sem tirá-lo da tela", async () => {
    // Sumir com o botão faria quem procura por ele achar que o sistema quebrou.
    render(
      <MockedProvider mocks={[planMock(300, 300)]}>
        <PlanLimitGate limit="CLIENTS">
          <button>Novo Cliente</button>
        </PlanLimitGate>
      </MockedProvider>
    );
    // Reconsultado a cada tentativa: ao entrar no teto o botão é remontado
    // dentro do wrapper, e a referência antiga aponta para uma árvore solta.
    await waitFor(() => {
      const button = screen.getByRole("button", { name: "Novo Cliente" });
      expect(button.closest("[aria-disabled]")).not.toBeNull();
    });
  });
});

describe("FeatureGate", () => {
  const withPlan = (features: string[], children: ReactNode) =>
    render(
      <PlanProvider
        plan={{
          code: "basic",
          label: "Básico",
          features: features as ComponentProps<
            typeof PlanProvider
          >["plan"]["features"],
        }}
      >
        {children}
      </PlanProvider>
    );

  it("mostra o que o plano contratou", () => {
    withPlan(["BULK_IMPORT"], <button>Importar planilha</button>);
    expect(
      screen.getByRole("button", { name: "Importar planilha" })
    ).toBeTruthy();
  });

  it("some com o que o plano não tem — não desabilita, some", () => {
    // Diferente do teto: recurso ausente não é um limite que se explica, é algo
    // que a empresa nunca contratou. Botão que recusa no clique parece defeito.
    withPlan(
      ["COMMISSIONS"],
      <FeatureGate feature="BULK_IMPORT">
        <button>Importar planilha</button>
      </FeatureGate>
    );
    expect(
      screen.queryByRole("button", { name: "Importar planilha" })
    ).toBeNull();
  });

  it("aceita um conteúdo alternativo no lugar", () => {
    withPlan(
      [],
      <FeatureGate feature="ROUTINES" fallback={<span>Disponível no Pro</span>}>
        <button>Rota do dia</button>
      </FeatureGate>
    );
    expect(screen.getByText("Disponível no Pro")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Rota do dia" })).toBeNull();
  });
});
