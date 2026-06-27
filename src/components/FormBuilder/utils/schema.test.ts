import { describe, expect, it } from "vitest";
import type { FormFieldSchema, FormStepSchema } from "../interface";
import { buildYupSchema } from "./schema";

/** Monta um schema de step único com os campos informados. */
const schemaOf = (...fields: FormFieldSchema[]) =>
  buildYupSchema([{ id: "step", sections: [{ id: "sec", fields }] }]);

const steps: FormStepSchema[] = [
  {
    id: "step",
    sections: [
      {
        id: "sec",
        fields: [
          { name: "email", type: "email", required: true },
          { name: "sku", type: "text", required: true, minLength: 3 },
        ],
      },
    ],
  },
];

describe("buildYupSchema", () => {
  const schema = buildYupSchema(steps);

  it("aceita payload válido", () => {
    expect(() =>
      schema.validateSync({ email: "a@b.com", sku: "ABC" })
    ).not.toThrow();
  });

  it("exige campo obrigatório", () => {
    expect(() => schema.validateSync({ email: "", sku: "ABC" })).toThrow();
  });

  it("rejeita email inválido com a mensagem do projeto", () => {
    expect(() => schema.validateSync({ email: "naoé", sku: "ABC" })).toThrow(
      /Email inválido/
    );
  });

  it("aplica minLength do campo de texto", () => {
    expect(() => schema.validateSync({ email: "a@b.com", sku: "ab" })).toThrow(
      /Mínimo 3/
    );
  });
});

describe("buildYupSchema — campos de texto", () => {
  it("aplica maxLength", () => {
    const schema = schemaOf({ name: "t", type: "text", maxLength: 4 });
    expect(() => schema.validateSync({ t: "abcde" })).toThrow(/Máximo 4/);
    expect(() => schema.validateSync({ t: "abcd" })).not.toThrow();
  });

  it("valida textarea e password como string", () => {
    const schema = schemaOf(
      { name: "bio", type: "textarea", minLength: 2 },
      { name: "pwd", type: "password", maxLength: 3 }
    );
    expect(() => schema.validateSync({ bio: "x", pwd: "ab" })).toThrow(
      /Mínimo 2/
    );
    expect(() => schema.validateSync({ bio: "ok", pwd: "abcd" })).toThrow(
      /Máximo 3/
    );
  });
});

describe("buildYupSchema — número", () => {
  const schema = schemaOf({ name: "qty", type: "number" });

  it("aceita número e converte não-numérico/vazio em indefinido (nullable)", () => {
    expect(() => schema.validateSync({ qty: 5 })).not.toThrow();
    expect(() => schema.validateSync({ qty: null })).not.toThrow();
    // transform: NaN/"" → undefined, então campo opcional não quebra.
    expect(schema.validateSync({ qty: "abc" }).qty).toBeUndefined();
  });
});

describe("buildYupSchema — data", () => {
  it("usa labelText na mensagem de typeError", () => {
    const schema = schemaOf({
      name: "d",
      type: "date",
      labelText: "Nascimento",
    });
    expect(() => schema.validateSync({ d: "xx" })).toThrow(
      /Nascimento é obrigatória/
    );
  });

  it("usa label string quando não há labelText", () => {
    const schema = schemaOf({ name: "d", type: "date", label: "Entrega" });
    expect(() => schema.validateSync({ d: "xx" })).toThrow(
      /Entrega é obrigatória/
    );
  });

  it("usa 'Data' como fallback quando label não é string", () => {
    const schema = schemaOf({ name: "d", type: "date" });
    expect(() => schema.validateSync({ d: "xx" })).toThrow(
      /Data é obrigatória/
    );
  });

  it("aceita data válida e nula", () => {
    const schema = schemaOf({ name: "d", type: "date" });
    expect(() => schema.validateSync({ d: new Date() })).not.toThrow();
    expect(() => schema.validateSync({ d: null })).not.toThrow();
  });
});

describe("buildYupSchema — date-range", () => {
  const schema = schemaOf({ name: "period", type: "date-range" });

  it("aceita intervalo crescente", () => {
    expect(() =>
      schema.validateSync({
        period: { from: new Date("2026-01-01"), to: new Date("2026-02-01") },
      })
    ).not.toThrow();
  });

  it("rejeita intervalo invertido", () => {
    expect(() =>
      schema.validateSync({
        period: { from: new Date("2026-02-01"), to: new Date("2026-01-01") },
      })
    ).toThrow(/Data final deve ser depois da inicial/);
  });

  it("exige data inicial e final", () => {
    expect(() =>
      schema.validateSync({ period: { from: null, to: null } })
    ).toThrow();
  });
});

describe("buildYupSchema — múltipla escolha (array)", () => {
  it("checkbox/switch/select-multi exigem ao menos uma opção quando required", () => {
    const schema = schemaOf(
      { name: "c", type: "checkbox", required: true, options: [] },
      { name: "s", type: "switch", required: true, options: [] },
      { name: "m", type: "select-multi", required: true, options: [] }
    );
    expect(() => schema.validateSync({ c: [], s: ["x"], m: ["y"] })).toThrow(
      /Selecione ao menos uma opção/
    );
    expect(() =>
      schema.validateSync({ c: ["a"], s: ["b"], m: ["c"] })
    ).not.toThrow();
  });

  it("não exige seleção quando o campo é opcional", () => {
    const schema = schemaOf({ name: "c", type: "checkbox", options: [] });
    expect(() => schema.validateSync({ c: [] })).not.toThrow();
    expect(() => schema.validateSync({ c: null })).not.toThrow();
  });
});

describe("buildYupSchema — arquivos", () => {
  it("archive exige ao menos um arquivo quando required", () => {
    const schema = schemaOf(
      { name: "a1", type: "archive-single", required: true },
      { name: "a2", type: "archive-multi", required: true }
    );
    expect(() => schema.validateSync({ a1: [], a2: [{}] })).toThrow(
      /Selecione ao menos um arquivo/
    );
    expect(() => schema.validateSync({ a1: [{}], a2: [{}] })).not.toThrow();
  });

  it("archive opcional aceita vazio", () => {
    const schema = schemaOf({ name: "a1", type: "archive-single" });
    expect(() => schema.validateSync({ a1: [] })).not.toThrow();
  });
});

describe("buildYupSchema — tipos com máscara (default)", () => {
  it("trata campos mascarados como string obrigatória", () => {
    const schema = schemaOf({ name: "cpf", type: "cpf", required: true });
    expect(() => schema.validateSync({ cpf: "" })).toThrow();
    expect(() => schema.validateSync({ cpf: "123.456.789-00" })).not.toThrow();
  });
});

describe("buildYupSchema — escolha única", () => {
  it("radio/select-single aceitam valor ou nulo", () => {
    const schema = schemaOf(
      { name: "r", type: "radio", options: [] },
      { name: "ss", type: "select-single", options: [] }
    );
    expect(() => schema.validateSync({ r: "a", ss: null })).not.toThrow();
  });
});

describe("buildYupSchema — required e mensagens", () => {
  it("usa labelText na mensagem de obrigatoriedade", () => {
    const schema = schemaOf({
      name: "ss",
      type: "select-single",
      required: true,
      labelText: "Categoria",
      options: [],
    });
    expect(() => schema.validateSync({ ss: null })).toThrow(
      /Categoria é obrigatório/
    );
  });

  it("usa label string quando não há labelText", () => {
    const schema = schemaOf({
      name: "ss",
      type: "select-single",
      required: true,
      label: "Marca",
      options: [],
    });
    expect(() => schema.validateSync({ ss: null })).toThrow(
      /Marca é obrigatório/
    );
  });

  it("usa mensagem genérica quando label não é string", () => {
    const schema = schemaOf({
      name: "ss",
      type: "select-single",
      required: true,
      options: [],
    });
    expect(() => schema.validateSync({ ss: null })).toThrow(
      /Este campo é obrigatório/
    );
  });
});

describe("buildYupSchema — seções repetíveis", () => {
  const schema = buildYupSchema([
    {
      id: "step",
      sections: [
        {
          id: "items",
          name: "items",
          isRepeatable: true,
          fields: [{ name: "sku", type: "text", required: true }],
        },
      ],
    },
  ]);

  it("exige pelo menos um item na seção", () => {
    expect(() => schema.validateSync({ items: [] })).toThrow(
      /Adicione pelo menos um item nesta seção/
    );
  });

  it("valida os campos de cada item", () => {
    expect(() => schema.validateSync({ items: [{ sku: "" }] })).toThrow();
    expect(() =>
      schema.validateSync({ items: [{ sku: "ABC" }] })
    ).not.toThrow();
  });

  it("aceita seção nula", () => {
    expect(() => schema.validateSync({ items: null })).not.toThrow();
  });
});
