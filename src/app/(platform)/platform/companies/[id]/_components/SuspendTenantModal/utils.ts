import { FormStepSchema } from "@/components/FormBuilder";

/**
 * Só a suspensão tem formulário: reativar não pede nada.
 *
 * O motivo é OBRIGATÓRIO — o backend recusa sem ele, e é esse texto que a
 * trilha de auditoria mostra meses depois, quando alguém for entender por que a
 * conta parou.
 */
export const SUSPEND_STEPS: FormStepSchema[] = [
  {
    id: "suspend",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "reason",
            type: "text",
            label: "Motivo",
            placeholder: "Ex.: inadimplência desde 07/2026",
            required: true,
            maxLength: 255,
            hint: "Fica registrado na auditoria — é o que explica a suspensão depois.",
          },
        ],
      },
    ],
  },
];

/** Motivo em branco vira null: a coluna aceita nulo, string vazia não diz nada. */
export const reasonOf = (data: Record<string, unknown>): string | null =>
  String(data.reason ?? "").trim() || null;
