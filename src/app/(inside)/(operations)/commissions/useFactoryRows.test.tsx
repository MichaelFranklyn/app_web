import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { COMMISSIONS_FACTORY_ROWS_QUERY } from "./gql";
import { CommissionMonthInput, CommissionRow } from "./interface";
import { COMMISSIONS_PAGE_SIZE } from "./useCommissionsQuery";
import { useFactoryRows } from "./useFactoryRows";

const INPUT: CommissionMonthInput = {
  from: "2026-09-01",
  to: "2026-09-30",
  sellerId: null,
  audience: "office",
  tab: "received",
};

const parcela = (installmentId: string) =>
  ({
    __typename: "CommissionRowType",
    orderId: `o-${installmentId}`,
    installmentId,
    sequence: 1,
    orderDate: "2026-08-20",
    invoicedAt: "2026-09-01",
    invoiceNumber: "12345",
    dueDate: "2026-09-30",
    paidAt: null,
    installmentAmount: "100.00",
    amount: "10.00",
    status: "received",
    receiveDate: "2026-09-10",
    isReceivable: false,
    isReceived: true,
    isReconciled: false,
    reconciledAt: null,
    isOverdue: false,
    defaultedAt: null,
    isChargebackSettled: false,
    chargebackSettledAt: null,
    sellerAmount: "4.00",
    sellerStatus: "received",
    sellerReceiveDate: "2026-09-10",
    isSellerPaid: false,
    sellerChargebackMonth: null,
    isSellerChargebackSettled: false,
    sellerChargebackSettledAt: null,
    client: {
      __typename: "ClientType",
      id: "c1",
      razaoSocial: "ALTO LTDA",
      nomeFantasia: "Alto",
    },
    factory: {
      __typename: "FactoryType",
      id: "f1",
      nomeFantasia: "HERC",
      nickname: null,
      razaoSocial: "HERC SA",
    },
    seller: { __typename: "SellerType", id: "s1", name: "Rafael" },
  }) as unknown as CommissionRow;

const pageMock = (
  input: CommissionMonthInput,
  offset: number,
  ids: string[],
  totalCount = 120
) => ({
  request: {
    query: COMMISSIONS_FACTORY_ROWS_QUERY,
    variables: {
      input,
      factoryId: "f1",
      first: COMMISSIONS_PAGE_SIZE,
      offset,
    },
  },
  result: {
    data: {
      commission_month_rows: {
        __typename: "CommissionMonthRowsType",
        factoryId: "f1",
        totalCount,
        rows: ids.map(parcela),
      },
    },
  },
});

const wrapperWith = (mocks: ReturnType<typeof pageMock>[]) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <MockedProvider mocks={mocks}>{children}</MockedProvider>;
  }
  return Wrapper;
};

const ids = (rows?: CommissionRow[]) => rows?.map((row) => row.installmentId);

describe("useFactoryRows", () => {
  it("cartão fechado não busca nada", () => {
    const { result } = renderHook(
      () => useFactoryRows({ input: INPUT, factoryId: "f1", enabled: false }),
      { wrapper: wrapperWith([]) }
    );
    expect(result.current.rows).toBeUndefined();
    expect(result.current.showSkeleton).toBe(false);
  });

  it("aberto, pede a primeira página da fábrica com o recorte da tela", async () => {
    const { result } = renderHook(
      () => useFactoryRows({ input: INPUT, factoryId: "f1", enabled: true }),
      { wrapper: wrapperWith([pageMock(INPUT, 0, ["a", "b"])]) }
    );
    expect(result.current.showSkeleton).toBe(true);

    await waitFor(() => expect(ids(result.current.rows)).toEqual(["a", "b"]));
    // 120 parcelas em páginas de 50: o total é o da fábrica, não o da página.
    expect(result.current.totalCount).toBe(120);
    expect(result.current.totalPages).toBe(3);
  });

  it("a primeira página que veio com o resumo dispensa a segunda consulta", () => {
    const seed = { factoryId: "f1", totalCount: 2, rows: [parcela("s1")] };
    // Sem mock nenhum: se o hook buscasse, o MockedProvider reprovaria.
    const { result } = renderHook(
      () =>
        useFactoryRows({ input: INPUT, factoryId: "f1", enabled: true, seed }),
      { wrapper: wrapperWith([]) }
    );
    expect(ids(result.current.rows)).toEqual(["s1"]);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasFailed).toBe(false);
  });

  it("a semente é do PRIMEIRO cartão: outra fábrica busca as suas linhas", async () => {
    const seed = { factoryId: "outra", totalCount: 1, rows: [parcela("x")] };
    const { result } = renderHook(
      () =>
        useFactoryRows({ input: INPUT, factoryId: "f1", enabled: true, seed }),
      { wrapper: wrapperWith([pageMock(INPUT, 0, ["a"], 1)]) }
    );
    await waitFor(() => expect(ids(result.current.rows)).toEqual(["a"]));
  });

  it("trocar de página pede o deslocamento certo ao servidor", async () => {
    const seed = { factoryId: "f1", totalCount: 120, rows: [parcela("p1")] };
    const { result } = renderHook(
      () =>
        useFactoryRows({ input: INPUT, factoryId: "f1", enabled: true, seed }),
      { wrapper: wrapperWith([pageMock(INPUT, COMMISSIONS_PAGE_SIZE, ["p2"])]) }
    );
    act(() => result.current.setPage(2));

    await waitFor(() => expect(ids(result.current.rows)).toEqual(["p2"]));
    expect(result.current.page).toBe(2);
  });

  it("mudar o recorte volta para a primeira página", async () => {
    const other = { ...INPUT, tab: "all" };
    const { result, rerender } = renderHook(
      ({ input }: { input: CommissionMonthInput }) =>
        useFactoryRows({ input, factoryId: "f1", enabled: true }),
      {
        initialProps: { input: INPUT },
        wrapper: wrapperWith([
          pageMock(INPUT, 0, ["a"]),
          pageMock(INPUT, COMMISSIONS_PAGE_SIZE, ["b"]),
          pageMock(other, 0, ["c"]),
        ]),
      }
    );
    await waitFor(() => expect(ids(result.current.rows)).toEqual(["a"]));
    act(() => result.current.setPage(2));
    await waitFor(() => expect(ids(result.current.rows)).toEqual(["b"]));

    // A página 2 de outro recorte não quer dizer nada neste.
    rerender({ input: other });
    expect(result.current.page).toBe(1);
    await waitFor(() => expect(ids(result.current.rows)).toEqual(["c"]));
  });
});
