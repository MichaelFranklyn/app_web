import { describe, expect, it } from "vitest";

import { RawEntityRow } from "./interface";
import { toEntityPoints } from "./utils";

describe("toEntityPoints", () => {
  it("mapeia ticket (Decimal→string) para número", () => {
    const rows: RawEntityRow[] = [
      {
        entityId: "1",
        entityName: "Real PE",
        avgTicket: "5839.64",
        orderCount: 7,
      },
    ];

    expect(toEntityPoints(rows, "avgTicket")).toEqual([
      { entityName: "Real PE", value: 5839.64, orderCount: 7 },
    ]);
  });

  it("mapeia intervalo (Float) mantendo o número", () => {
    const rows: RawEntityRow[] = [
      { entityId: "1", entityName: "Cliente A", avgDays: 18.5, orderCount: 4 },
    ];

    expect(toEntityPoints(rows, "avgDays")).toEqual([
      { entityName: "Cliente A", value: 18.5, orderCount: 4 },
    ]);
  });

  it("trata campo de valor ausente como zero", () => {
    const rows: RawEntityRow[] = [
      { entityId: "1", entityName: "Sem dado", orderCount: 0 },
    ];

    expect(toEntityPoints(rows, "avgTicket")).toEqual([
      { entityName: "Sem dado", value: 0, orderCount: 0 },
    ]);
  });

  it("preserva a ordem vinda do backend", () => {
    const rows: RawEntityRow[] = [
      { entityId: "1", entityName: "A", avgTicket: "300", orderCount: 2 },
      { entityId: "2", entityName: "B", avgTicket: "200", orderCount: 5 },
      { entityId: "3", entityName: "C", avgTicket: "100", orderCount: 1 },
    ];

    expect(toEntityPoints(rows, "avgTicket").map((p) => p.entityName)).toEqual([
      "A",
      "B",
      "C",
    ]);
  });
});
