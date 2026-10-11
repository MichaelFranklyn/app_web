import { describe, expect, it } from "vitest";

import { situationOptions } from "./utils";

describe("situationOptions", () => {
  it("põe a quantidade no rótulo e soma o que está em aberto", () => {
    const options = situationOptions({
      OVERDUE: 2,
      TODAY: 1,
      UPCOMING: 4,
      DONE: 9,
    });
    expect(options.map((o) => o.label)).toEqual([
      "Em aberto · 7",
      "Atrasados · 2",
      "Hoje · 1",
      "Próximos · 4",
      "Concluídos · 9",
      // O recorte zerado continua escolhível: "0 cancelados" é informação.
      "Cancelados · 0",
    ]);
  });
});
