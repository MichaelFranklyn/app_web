import { FormStepSchema } from "@/components/FormBuilder";
import { toIsoDate } from "@/utils/format/date";

export const COMMISSION_BASIS_OPTIONS = [
  { value: "Faturado", label: "Faturado" },
  { value: "Pedido", label: "Pedido" },
];

export const FORM_STEPS: FormStepSchema[] = [
  {
    id: "factory",
    title: "Dados da Fábrica",
    sections: [
      {
        id: "factory-info",
        fields: [
          {
            name: "cnpj",
            type: "cnpj",
            label: "CNPJ",
            required: true,
            placeholder: "Digite o CNPJ da fábrica a ser vinculada",
          },
        ],
      },
    ],
  },
  {
    id: "commercial",
    title: "Configurações Comerciais",
    sections: [
      {
        id: "commercial-terms",
        title: "Termos Comerciais",
        fields: [
          {
            name: "commissionRate",
            type: "number",
            label: "Taxa de comissão (%)",
            required: true,
            placeholder: "Digite a taxa de comissão para essa fábrica",
          },
          {
            name: "commissionCalcBasis",
            type: "select-single",
            label: "Base de cálculo",
            required: true,
            options: COMMISSION_BASIS_OPTIONS,
            placeholder: "Selecione a base de cálculo da comissão",
          },
          {
            name: "paymentTermDays",
            type: "number",
            label: "Dia de pagamento da fábrica",
            required: true,
            placeholder: "Dia do mês em que a fábrica paga (ex: 5, 10, 31)",
          },
          {
            name: "territory",
            type: "text",
            label: "Território",
            required: true,
            placeholder: "Ex: Sul, Sudeste, Nacional...",
          },
          {
            name: "contractStart",
            type: "date",
            label: "Início do contrato",
            required: false,
          },
          {
            name: "contractEnd",
            type: "date",
            label: "Término do contrato",
            required: false,
          },
          {
            name: "specialConditions",
            type: "textarea",
            label: "Condições especiais",
            required: false,
            placeholder: "Descreva condições especiais do contrato...",
            rows: 4,
          },
        ],
      },
    ],
  },
];

const toIsoOrNull = (value: unknown): string | null => {
  const iso = toIsoDate(value);
  return iso || null;
};

export const normalizeInput = (data: Record<string, unknown>) => {
  const commissionCalcBasisRaw = data.commissionCalcBasis;
  const commissionCalcBasis =
    commissionCalcBasisRaw !== null &&
    typeof commissionCalcBasisRaw === "object"
      ? (commissionCalcBasisRaw as { value: string }).value
      : String(commissionCalcBasisRaw ?? "");

  const specialConditionsRaw = data.specialConditions;
  const specialConditions =
    specialConditionsRaw && String(specialConditionsRaw).trim()
      ? { note: String(specialConditionsRaw).trim() }
      : null;

  return {
    cnpj: String(data.cnpj ?? "").replace(/\D/g, ""),
    commissionRate: Number(data.commissionRate),
    commissionCalcBasis,
    paymentTermDays: Number(data.paymentTermDays),
    territory: String(data.territory ?? "").trim(),
    contractStart: toIsoOrNull(data.contractStart),
    contractEnd: toIsoOrNull(data.contractEnd),
    specialConditions,
  };
};
