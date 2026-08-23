import { FormStepSchema } from "@/components/FormBuilder";

/**
 * O exemplo do campo muda com a ação — "saiu da equipe" não serve de modelo
 * para quem está devolvendo acesso —, por isso os passos são construídos e não
 * constantes.
 *
 * O motivo continua OPCIONAL: a mutation aceita nulo, e travar aqui inventaria
 * uma regra que o backend não cobra.
 */
export const buildRevokeSteps = (isRevoking: boolean): FormStepSchema[] => [
  {
    id: "revoke",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "reason",
            type: "text",
            label: "Motivo",
            placeholder: isRevoking
              ? "Ex.: saiu da equipe em 13/08"
              : "Ex.: retorno de férias",
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
