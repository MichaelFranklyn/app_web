import { MockedProvider } from "@apollo/client/testing/react";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { DASHBOARD_FACTORIES_QUERY, DASHBOARD_SELLERS_QUERY } from "../gql";
import { ReportFilters } from "./interface";
import { useReportContext } from "./useReportContext";

const INPUT = { input: { first: 200 } };

const sellersMock = {
  request: { query: DASHBOARD_SELLERS_QUERY, variables: INPUT },
  maxUsageCount: 5,
  result: {
    data: {
      dashboard_sellers: {
        __typename: "UserTypeConnection",
        edges: [
          {
            __typename: "UserTypeEdge",
            node: { __typename: "UserType", id: "s1", name: "Rafael" },
          },
        ],
        totalCount: 1,
      },
    },
  },
};

const factoriesMock = (nickname: string | null) => ({
  request: { query: DASHBOARD_FACTORIES_QUERY, variables: INPUT },
  maxUsageCount: 5,
  result: {
    data: {
      dashboard_factories: {
        __typename: "CompanyFactoryConnection",
        edges: [
          {
            __typename: "CompanyFactoryEdge",
            node: {
              __typename: "CompanyFactoryType",
              id: "cf1",
              nickname,
              factory: {
                __typename: "FactoryType",
                id: "f1",
                nomeFantasia: "HERC",
                razaoSocial: "HERC INDUSTRIA SA",
              },
            },
          },
        ],
        totalCount: 1,
      },
    },
  },
});

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */
    <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
  );
  return Wrapper;
};

const run = (mocks: unknown[], filters: Partial<ReportFilters> = {}) =>
  renderHook(
    () =>
      useReportContext({
        from: "2026-09-01",
        to: "2026-09-30",
        sellerId: null,
        factoryId: null,
        ...filters,
      }),
    { wrapper: wrapper(mocks) }
  ).result;

describe("useReportContext", () => {
  it("sem recorte, o papel diz que cobre a empresa toda", async () => {
    // A ausência da linha seria lida como omissão.
    const result = run([]);

    expect(result.current.context).toContain("Vendedor: todos");
    expect(result.current.context.join(" ")).toContain("Período:");
  });

  it("com vendedor escolhido, escreve o NOME — não o id", async () => {
    // Um relatório de um vendedor impresso sem dizer isso passa por "a empresa
    // toda", e é assim que uma reunião discute o número errado.
    const result = run([sellersMock], { sellerId: "s1" });

    await waitFor(() => expect(result.current.sellerName).toBe("Rafael"));
    expect(result.current.context).toContain("Vendedor: Rafael");
  });

  it("a fábrica aparece pelo apelido do vínculo", async () => {
    // É o nome pelo qual a casa reconhece a representada, e o que estava no
    // seletor que a pessoa acabou de usar.
    const result = run([factoriesMock("Herc Nordeste")], {
      factoryId: "f1",
    });

    await waitFor(() =>
      expect(result.current.factoryName).toBe("Herc Nordeste")
    );
    expect(result.current.context).toContain("Fábrica: Herc Nordeste");
  });

  it("sem apelido, cai no nome fantasia", async () => {
    const result = run([factoriesMock(null)], { factoryId: "f1" });

    await waitFor(() => expect(result.current.factoryName).toBe("HERC"));
  });

  it("aba sem recorte de fábrica não escreve 'Fábrica: todas'", async () => {
    // Numa aba que não filtra por fábrica, a linha seria ruído afirmando o óbvio.
    const result = run([]);

    expect(result.current.context.join(" ")).not.toContain("Fábrica:");
  });

  it("com recorte e sem nome resolvido, o travessão diz que há recorte", async () => {
    const result = run([factoriesMock(null)], { factoryId: "f-desconhecida" });

    await waitFor(() => expect(result.current.context).toContain("Fábrica: —"));
  });
});
