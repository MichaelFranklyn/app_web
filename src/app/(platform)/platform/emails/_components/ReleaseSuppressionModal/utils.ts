import { FormStepSchema } from "@/components/FormBuilder";

/** Motivo opcional: a mutation aceita nulo, e a tela não inventa regra que o
 * backend não cobra. */
export const RELEASE_STEPS: FormStepSchema[] = [
  {
    id: "release",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "reason",
            type: "text",
            label: "Motivo",
            placeholder: "Ex.: cliente corrigiu a caixa postal",
            maxLength: 255,
            hint: "Fica registrado na auditoria permanente da plataforma.",
          },
        ],
      },
    ],
  },
];

/** Motivo em branco vira null: a trilha guarda ausência, não string vazia. */
export const reasonOf = (data: Record<string, unknown>): string | null =>
  String(data.reason ?? "").trim() || null;
