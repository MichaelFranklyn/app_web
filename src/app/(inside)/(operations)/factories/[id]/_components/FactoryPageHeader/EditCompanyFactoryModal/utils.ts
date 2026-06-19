import { FormStepSchema } from "@/components/FormBuilder";
import { toIsoDate } from "@/utils/format/date";
import { CompanyFactoryDetail } from "../../../interface";
import { UpdateCompanyFactoryInput } from "./interface";

export const COMMISSION_BASIS_OPTIONS = [
  { value: "Faturado", label: "Faturado" },
  { value: "Pedido", label: "Pedido" },
];

export const FORM_STEPS: FormStepSchema[] = [
  {
    id: "commercial",
    sections: [
      {
        id: "terms",
        fields: [
          {
            name: "commissionRate",
            label: "Taxa de comissão (%)",
            type: "number",
            required: true,
            placeholder: "Ex: 5",
          },
          {
            name: "commissionCalcBasis",
            label: "Base de cálculo",
            type: "select-single",
            required: true,
            options: COMMISSION_BASIS_OPTIONS,
          },
          {
            name: "paymentTermDays",
            label: "Dia de pagamento da fábrica",
            type: "number",
            required: true,
            placeholder: "Ex: 30",
          },
          {
            name: "territory",
            label: "Território",
            type: "text",
            required: true,
            placeholder: "Ex: Zona Sul, Interior SP",
          },
          {
            name: "contractStart",
            label: "Início do contrato",
            type: "date",
            required: false,
          },
          {
            name: "contractEnd",
            label: "Término do contrato",
            type: "date",
            required: false,
          },
        ],
      },
    ],
  },
];

const toDateOrNull = (value: unknown): string | null => {
  const iso = toIsoDate(value);
  return iso || null;
};

export const normalizeInput = (
  data: Record<string, unknown>,
  initial: CompanyFactoryDetail
): UpdateCompanyFactoryInput => {
  const input: UpdateCompanyFactoryInput = {};

  const rate = Number(data.commissionRate);
  if (!Number.isNaN(rate) && rate !== initial.commissionRate) {
    input.commissionRate = rate;
  }

  const basisRaw = data.commissionCalcBasis;
  const basis =
    basisRaw && typeof basisRaw === "object" && "value" in basisRaw
      ? String((basisRaw as { value: string }).value)
      : String(basisRaw ?? "");
  if (basis && basis !== initial.commissionCalcBasis) {
    input.commissionCalcBasis = basis;
  }

  const days = Number(data.paymentTermDays);
  if (!Number.isNaN(days) && days !== initial.paymentTermDays) {
    input.paymentTermDays = days;
  }

  const territory = String(data.territory ?? "").trim();
  if (territory && territory !== initial.territory) {
    input.territory = territory;
  }

  const contractStart = toDateOrNull(data.contractStart);
  const initialStart = toDateOrNull(initial.contractStart);
  if (contractStart !== initialStart) {
    input.contractStart = contractStart ?? undefined;
  }

  const contractEnd = toDateOrNull(data.contractEnd);
  const initialEnd = toDateOrNull(initial.contractEnd);
  if (contractEnd !== initialEnd) {
    input.contractEnd = contractEnd ?? undefined;
  }

  return input;
};
