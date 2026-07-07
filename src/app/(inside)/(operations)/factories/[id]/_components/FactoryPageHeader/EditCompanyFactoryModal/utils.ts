import { FormStepSchema } from "@/components/FormBuilder";
import { toIsoDate } from "@/utils/format/date";
import { CompanyFactoryDetail } from "../../../interface";
import { UpdateCompanyFactoryInput } from "./interface";

// Os valores "Faturado"/"Pedido" são mantidos por compatibilidade com fábricas já
// cadastradas; os rótulos usam a terminologia da comissão (Faturamento/Pagamento).
export const COMMISSION_BASIS_OPTIONS = [
  { value: "Faturado", label: "Faturamento — comissão paga no faturamento" },
  { value: "Pedido", label: "Pagamento — comissão conforme o cliente paga" },
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
            name: "paymentDays",
            label: "Dia(s) de pagamento da comissão",
            type: "text",
            required: true,
            placeholder: "Ex: 10 ou 5, 20",
            hint: "Dia(s) do mês em que a fábrica paga a comissão. Separe múltiplos por vírgula.",
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

  // Um único campo captura os dias de pagamento da comissão (pode ser múltiplos).
  // Popula `commissionPaymentDays` e mantém o legado `paymentTermDays` (dia único,
  // NOT NULL) sincronizado com o primeiro dia.
  const parsedDays = Array.from(
    new Set(
      (String(data.paymentDays ?? "").match(/\d+/g) ?? [])
        .map(Number)
        .filter((n) => n >= 1 && n <= 31)
    )
  ).sort((a, b) => a - b);
  const initialDays = initial.commissionPaymentDays ?? [
    initial.paymentTermDays,
  ];
  const daysChanged =
    parsedDays.length > 0 &&
    (parsedDays.length !== initialDays.length ||
      parsedDays.some((d, i) => d !== initialDays[i]));
  if (daysChanged) {
    input.commissionPaymentDays = parsedDays;
    input.paymentTermDays = parsedDays[0];
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
