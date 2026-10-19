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
    isFollowUp: false,
    followUp: null,
    client,
    clientFactoryLink: null,
    ...patch,
  }) as VisitScheduleItem;

describe("chipAppearance", () => {
  it("visita e contato têm cores diferentes; o combinado é contato", () => {
    expect(chipAppearance(item({})).tone).toBe("amber");
    expect(chipAppearance(item({ contactType: "REMOTE" })).tone).toBe("blue");
    expect(
      chipAppearance(item({ contactType: "REMOTE", isFollowUp: true })).tone
    ).toBe("blue");
  });

  it("a combinada mostra o motivo do combinado", () => {
    const look = chipAppearance(
      item({
        contactType: "REMOTE",
        isFollowUp: true,
        followUp: {
          id: "f1",
          reason: "Retornar sobre o orçamento",
          status: "SCHEDULED",
        },
      })
    );
    expect(look.detail).toBe("Retornar sobre o orçamento");
    expect(look.label).toMatch(/^Contato — /);
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
