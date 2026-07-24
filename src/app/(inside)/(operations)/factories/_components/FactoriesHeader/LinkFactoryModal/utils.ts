import { FormStepSchema } from "@/components/FormBuilder";
import { toIsoDate } from "@/utils/format/date";

// Os valores "Faturado"/"Pedido" são mantidos por compatibilidade com fábricas já
// cadastradas; os rótulos usam a terminologia da comissão (Faturamento/Pagamento).
export const COMMISSION_BASIS_OPTIONS = [
  { value: "Faturado", label: "Faturamento — comissão paga no faturamento" },
  { value: "Pedido", label: "Pagamento — comissão conforme o cliente paga" },
];

// Três passos curtos em vez de um formulário longo: quem cadastra a fábrica é
// o gestor, mas a tela precisa caber sem rolagem e deixar claro o que falta.
export const FORM_STEPS: FormStepSchema[] = [
  {
    id: "factory",
    title: "Fábrica",
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
          {
            name: "nickname",
            type: "text",
            label: "Apelido (opcional)",
            required: false,
            placeholder: "Como você chama esta fábrica no dia a dia",
            hint: "Aparece no lugar do nome oficial nas telas e nos pedidos. Você pode definir depois.",
          },
        ],
      },
    ],
  },
  {
    id: "commission",
    title: "Comissão",
    sections: [
      {
        id: "commission-terms",
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
        ],
      },
    ],
  },
  {
    id: "contract",
    title: "Contrato",
    sections: [
      {
        id: "contract-terms",
        fields: [
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
            grid: { desktop: 6 },
          },
          {
            name: "contractEnd",
            type: "date",
            label: "Término do contrato",
            required: false,
            grid: { desktop: 6 },
          },
          {
            name: "ipiInOrder",
            type: "switch",
            label: "IPI cobrado no pedido",
            options: [
              {
                value: "true",
                label:
                  "Esta fábrica não traz IPI na tabela — o IPI é lançado por item no pedido",
              },
            ],
          },
          {
            name: "specialConditions",
            type: "textarea",
            label: "Condições especiais",
            required: false,
            placeholder: "Descreva condições especiais do contrato...",
            rows: 3,
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
    ipiInOrder:
      Array.isArray(data.ipiInOrder) && data.ipiInOrder.includes("true"),
    nickname: String(data.nickname ?? "").trim() || null,
  };
};
