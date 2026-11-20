import { describe, expect, it } from "vitest";

import { canDragItem, readDrag } from "./dragItem";

describe("canDragItem", () => {
  it("só a parada pendente e já gravada muda de dia", () => {
    expect(canDragItem({ status: "PENDING" }, false)).toBe(true);
    expect(canDragItem({ status: "COMPLETED" }, false)).toBe(false);
    expect(canDragItem({ status: "PENDING" }, true)).toBe(false);
  });
});

describe("readDrag", () => {
  it("lê o que o card escreveu", () => {
    const raw = JSON.stringify({ itemId: "i1", fromDate: "2026-10-19" });
    expect(readDrag(raw)).toEqual({ itemId: "i1", fromDate: "2026-10-19" });
  });

  it("ignora dado estranho em vez de quebrar a tela", () => {
    expect(readDrag("não é json")).toBeNull();
    expect(readDrag(JSON.stringify({ itemId: "i1" }))).toBeNull();
  });
});
