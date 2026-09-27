import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DraftItem } from "../../_shared/orderDraftItems";
import {
  draftBackupKey,
  readDraftBackup,
  writeDraftBackup,
} from "./draftBackup";
import { useDraftBackup } from "./useDraftBackup";

vi.mock("@/hooks/useUserData", () => ({
  useUserData: () => ({ userData: { userId: "u1" } }),
}));

const ITEM: DraftItem = {
  productId: "p1",
  productLabel: "Massa corrida",
  tierId: "t1",
  tierLabel: "Atacado",
  unitPrice: 32.5,
  quantity: 12,
  discount: 0,
  discountInput: 0,
  discountType: "VALUE",
  ipiRate: 0,
  isPromo: false,
};

const KEY = draftBackupKey("u1", "f1", "c1");

/** O mínimo do rascunho que o hook usa: a lista e o `restore`. */
function fakeDraft(items: DraftItem[] = []) {
  return { items, restore: vi.fn() } as unknown as Parameters<
    typeof useDraftBackup
  >[0];
}

describe("draftBackup", () => {
  beforeEach(() => window.localStorage.clear());

  it("cópia de mais de uma semana some sozinha", () => {
    const old = new Date("2026-09-01T10:00:00Z");
    writeDraftBackup(KEY, [ITEM], old);
    expect(readDraftBackup(KEY, old.getTime() + 1000)).not.toBeNull();
    expect(readDraftBackup(KEY, old.getTime() + 8 * 86_400_000)).toBeNull();
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });
});

describe("useDraftBackup", () => {
  beforeEach(() => window.localStorage.clear());

  it("ao voltar ao mesmo cliente e fábrica, oferece os itens guardados", () => {
    writeDraftBackup(KEY, [ITEM]);
    const draft = fakeDraft();
    const { result } = renderHook(() => useDraftBackup(draft, "f1", "c1"));

    expect(result.current.offer?.items).toEqual([ITEM]);

    act(() => result.current.recover());
    expect(draft.restore).toHaveBeenCalledWith([ITEM]);
    expect(result.current.offer).toBeNull();
  });

  it("a lista vazia do começo da página não apaga a cópia antes da resposta", () => {
    writeDraftBackup(KEY, [ITEM]);
    renderHook(() => useDraftBackup(fakeDraft(), "f1", "c1"));
    expect(readDraftBackup(KEY)?.items).toEqual([ITEM]);
  });

  it("outro cliente não vê a cópia deste", () => {
    writeDraftBackup(KEY, [ITEM]);
    const { result } = renderHook(() =>
      useDraftBackup(fakeDraft(), "f1", "outro")
    );
    expect(result.current.offer).toBeNull();
  });

  it("descartar apaga a cópia", () => {
    writeDraftBackup(KEY, [ITEM]);
    const { result } = renderHook(() =>
      useDraftBackup(fakeDraft(), "f1", "c1")
    );
    act(() => result.current.discard());
    expect(readDraftBackup(KEY)).toBeNull();
  });

  it("espelha os itens enquanto a pessoa monta o pedido", () => {
    let draft = fakeDraft();
    const { rerender } = renderHook(() => useDraftBackup(draft, "f1", "c1"));
    draft = fakeDraft([ITEM]);
    rerender();
    expect(readDraftBackup(KEY)?.items).toEqual([ITEM]);
  });

  it("pedido criado: a cópia some", () => {
    const { result } = renderHook(() =>
      useDraftBackup(fakeDraft([ITEM]), "f1", "c1")
    );
    expect(readDraftBackup(KEY)).not.toBeNull();
    act(() => result.current.clear());
    expect(readDraftBackup(KEY)).toBeNull();
  });
});
