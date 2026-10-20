import { describe, expect, it } from "vitest";

import { VisitScheduleItem } from "./interface";
import { chipAppearance } from "./appearance";

const client = {
  id: "c1",
  razaoSocial: "Mercadinho Zé LTDA",
  nomeFantasia: "Zé",
};
const item = (patch: Partial<VisitScheduleItem>): VisitScheduleItem =>
  ({
    contactType: "IN_PERSON",
    status: "PENDING",
    reason: null,
    order: null,
    client,
    clientFactoryLink: null,
    ...patch,
  }) as VisitScheduleItem;

describe("chipAppearance", () => {
  it("visita e ligação têm cores diferentes", () => {
    expect(chipAppearance(item({})).tone).toBe("amber");
    expect(chipAppearance(item({ contactType: "REMOTE" })).tone).toBe("blue");
  });

  it("a parada marcada à mão mostra o motivo de quem marcou", () => {
    const look = chipAppearance(
      item({ contactType: "REMOTE", reason: "Retornar sobre o orçamento" })
    );
    expect(look.detail).toBe("Retornar sobre o orçamento");
    expect(look.label).toMatch(/^Ligação — /);
  });

  it("o que saiu do previsto diz o desfecho e fica esmaecido", () => {
    const look = chipAppearance(item({ status: "CLIENT_ABSENT" }));
    expect(look.isMuted).toBe(true);
    expect(look.detail).toBe("Cliente ausente");
  });

  it("feito fica riscado e não esmaecido como falha", () => {
    const look = chipAppearance(item({ status: "COMPLETED" }));
    expect(look.isDone).toBe(true);
    expect(look.isMuted).toBe(false);
    expect(look.label).toContain("(feito)");
  });
});
