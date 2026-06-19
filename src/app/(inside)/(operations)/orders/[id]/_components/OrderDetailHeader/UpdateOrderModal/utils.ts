import { FormStepSchema } from "@/components/FormBuilder";

export const UPDATE_ORDER_FORM_STEPS: FormStepSchema[] = [
  {
    id: "update",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "freightType",
            type: "select-single",
            label: "Frete",
            placeholder: "FOB ou CIF",
            options: [
              { value: "FOB", label: "FOB — frete por conta do cliente" },
              { value: "CIF", label: "CIF — entrega pela fábrica" },
            ],
          },
          {
            name: "notes",
            type: "textarea",
            label: "Observações",
            placeholder: "Observações do pedido...",
            rows: 4,
          },
        ],
      },
    ],
  },
];

const extractSelectValue = (val: unknown): string => {
  if (val && typeof val === "object" && "value" in val) {
    return String((val as { value: string }).value);
  }
  return String(val ?? "");
};

export const normalizeUpdateInput = (
  data: Record<string, unknown>,
  currentNotes: string | null,
  currentFreightType: string | null
): Record<string, unknown> => {
  const normalized: Record<string, unknown> = {};
  const next = data.notes != null ? String(data.notes).trim() : "";
  const current = (currentNotes ?? "").trim();
  if (next !== current) {
    normalized.notes = next === "" ? null : next;
  }
  const nextFreight = extractSelectValue(data.freightType) || null;
  if (nextFreight !== (currentFreightType ?? null)) {
    normalized.freightType = nextFreight;
  }
  return normalized;
};
