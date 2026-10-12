import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/commissions",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import {
  commissionFilterFields,
  COMMISSIONS_SORT_KEYS,
  useCommissionsPanel,
} from "./useCommissionsPanel";

describe("useCommissionsPanel", () => {
  beforeEach(() => {
    state.sp = new URLSearchParams();
  });

  it("manda ao servidor os filtros e a ordem da URL, nos nomes dele", () => {
    state.sp = new URLSearchParams(
      "search=casa&factoryId=f1&status=received&installmentState=overdue&reconciled=no&sellerId=s2&sortBy=amount&sortDir=desc"
    );
    const { result } = renderHook(() => useCommissionsPanel(true));

    expect(result.current.panelInput).toEqual({
      search: "casa",
      factoryId: "f1",
      status: "received",
      installmentState: "overdue",
      reconciled: "no",
      // O `sellerId` da consulta é o ESCOPO do gestor: o filtro do painel vai
      // com outro nome.
      panelSellerId: "s2",
      sortBy: "amount",
      sortDir: "desc",
    });
    expect(result.current.sort.key).toBe("amount");
  });

  it("fora do escritório o filtro por vendedor não existe, nem esquecido na URL", () => {
    state.sp = new URLSearchParams("sellerId=s2&factoryId=f1");
    const { result } = renderHook(() => useCommissionsPanel(false));

    expect(result.current.panelInput).toEqual({ factoryId: "f1" });
    expect(result.current.inputValues.sellerId).toBeUndefined();
  });

  it("coluna desconhecida (ou do painel de estornos) não vai para a consulta", () => {
    state.sp = new URLSearchParams("sortBy=cbClient&sortDir=asc");
    const { result } = renderHook(() => useCommissionsPanel(true));

    expect(result.current.panelInput).toEqual({});
    expect(result.current.sort.key).toBeNull();
  });

  it("sem nada na URL não manda filtro nenhum", () => {
    const { result } = renderHook(() => useCommissionsPanel(true));
    expect(result.current.panelInput).toEqual({});
    act(() => result.current.setFilters({ factoryId: "f9" }));
    expect(result.current.inputValues.factoryId).toBe("f9");
  });

  it("as colunas ordenáveis são as que o servidor conhece", () => {
    // Espelha `_SORT_COLUMNS` de commission_month.py: chave nova de um lado só
    // deixaria o cabeçalho aceso sobre uma lista que não foi ordenada.
    expect(COMMISSIONS_SORT_KEYS).toEqual([
      "client",
      "seller",
      "order",
      "invoiceNumber",
      "sequence",
      "dueDate",
      "receiveDate",
      "amount",
      "status",
      "reconciled",
    ]);
  });
});

describe("commissionFilterFields", () => {
  const options = {
    factories: [{ value: "f1", label: "Alfa" }],
    sellers: [{ value: "s1", label: "Ana" }],
    statuses: [{ value: "chargeback", label: "do servidor" }],
  };

  it("as opções vêm do servidor e a situação usa o rótulo da tela", () => {
    const fields = commissionFilterFields({
      ...options,
      canManage: true,
      showSeller: true,
    });
    const byKey = Object.fromEntries(fields.map((field) => [field.key, field]));

    expect(byKey.factoryId).toMatchObject({ options: options.factories });
    expect(byKey.sellerId).toMatchObject({ hidden: false });
    expect(byKey.status).toMatchObject({
      options: [{ value: "chargeback", label: "Estorno" }],
    });
  });

  it("vendedor não filtra por vendedor nem por conferência", () => {
    const fields = commissionFilterFields({
      ...options,
      canManage: false,
      showSeller: false,
    });
    const byKey = Object.fromEntries(fields.map((field) => [field.key, field]));

    expect(byKey.sellerId).toMatchObject({ hidden: true });
    expect(byKey.reconciled).toMatchObject({ hidden: true });
  });
});
