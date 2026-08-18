import { isPaymentBasis } from "@/app/(inside)/_shared/commissions";
import { FormStepSchema } from "@/components/FormBuilder";
import { toIsoDate } from "@/utils/format/date";
import { INSTALLMENT_DUE_BASIS_OPTIONS } from "@/app/(inside)/_shared/commissions";
import { CompanyFactoryDetail } from "../../../interface";
import { UpdateCompanyFactoryInput } from "./interface";

// Valores canônicos. O vocabulário legado ("Faturado"/"Pedido") saiu do banco na
// migration `d2b6e9c1f473`: "Pedido" queria dizer Pagamento aqui e quer dizer
// outra coisa em `installmentDueBasis`, logo abaixo no mesmo formulário.
export const COMMISSION_BASIS_OPTIONS = [
  { value: "Faturamento", label: "Faturamento — comissão paga no faturamento" },
  { value: "Pagamento", label: "Pagamento — comissão conforme o cliente paga" },
];

/**
 * Qual opção do select representa a base gravada na fábrica.
 *
 * Casar por igualdade não basta: uma base que ainda não passou pela migration
 * `d2b6e9c1f473` traz o texto antigo ("Faturado"), o `find` não acha nada e o
 * campo — que é obrigatório — abre VAZIO, travando a edição de qualquer outro
 * termo do contrato. Por isso o desempate segue a mesma regra do servidor:
 * "pag*" é Pagamento, o resto é Faturamento.
 */
export const commissionBasisOption = (basis: string | null | undefined) =>
  COMMISSION_BASIS_OPTIONS.find((opt) => opt.value === basis) ??
  (isPaymentBasis(basis)
    ? COMMISSION_BASIS_OPTIONS[1]
    : COMMISSION_BASIS_OPTIONS[0]);

// Dois passos no formulário (o terceiro — Identidade — é custom, fora do
// FormBuilder, porque a logo não é um campo de formulário comum).
export const FORM_STEPS: FormStepSchema[] = [
  {
    id: "commission",
    sections: [
      {
        id: "commission-terms",
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
            name: "commissionCutoffDay",
            label: "Corte do faturamento (dia do mês)",
            type: "number",
            required: false,
            placeholder: "Ex: 25",
            hint: "Até que dia do mês o pedido precisa ser faturado para a comissão entrar no pagamento do mês seguinte. Faturou depois? A comissão cai só no mês seguinte a esse. Deixe em branco se a fábrica não tem corte.",
          },
          {
            name: "installmentDueBasis",
            label: "Os dias do boleto contam de quando?",
            type: "select-single",
            required: false,
            options: INSTALLMENT_DUE_BASIS_OPTIONS,
            hint: "Prazo 30/60/90 conta da nota fiscal na maioria das fábricas, mas algumas contam da data em que o pedido foi feito. Muda o vencimento de cada boleto e, com ele, a previsão da comissão.",
          },
        ],
      },
    ],
  },
  {
    id: "contract",
    sections: [
      {
        id: "contract-terms",
        fields: [
          {
            name: "territory",
            label: "Território",
            type: "text",
            required: true,
            placeholder: "Ex: Zona Sul, Interior SP",
          },
          {
            name: "deliveryEstimateDays",
            label: "Prazo de entrega (dias)",
            type: "number",
            required: false,
            placeholder: "Ex: 15",
            hint: "Dias estimados até a mercadoria chegar na loja, contados do faturamento. Pré-preenche o pedido e avisa quando a entrega atrasa.",
          },
          // Os dois pisos ficam um embaixo do outro, em largura inteira: lado a
          // lado, o hint de cada um (uma frase explicando o que ele faz na
          // rotina) espremia a coluna e as duas regras — que são diferentes, uma
          // barra e a outra incentiva — passavam a ser lidas como um par.
          {
            name: "minOrderAmount",
            label: "Pedido mínimo (R$)",
            type: "number",
            required: false,
            placeholder: "Ex: 1000",
            hint: "Valor mínimo que a fábrica aceita. Abaixo dele o pedido não pode ser confirmado — e a rotina deixa de recomendar visita a quem não consegue fechar esse valor. Deixe em branco se a fábrica não exige mínimo.",
          },
          // Só CIF: frete grátis é a fábrica deixando de cobrar a ENTREGA. Em
          // FOB o cliente contrata o transporte por conta própria, não há o que
          // isentar — e por isso o aviso no pedido some na modalidade FOB.
          {
            name: "freeFreightCifAmount",
            label: "Frete grátis em CIF a partir de (R$)",
            type: "number",
            required: false,
            placeholder: "Ex: 5000",
            hint: "Valor a partir do qual a fábrica entrega sem cobrar frete. Vale só para pedidos CIF (em FOB o frete é contratado pelo cliente). Não bloqueia pedido nenhum — vira aviso ao vendedor enquanto falta valor. Deixe em branco se a fábrica não oferece.",
          },
          {
            name: "contractStart",
            label: "Início do contrato",
            type: "date",
            required: false,
            grid: { desktop: 6 },
          },
          {
            name: "contractEnd",
            label: "Término do contrato",
            type: "date",
            required: false,
            grid: { desktop: 6 },
          },
          {
            name: "ipiInOrder",
            label: "IPI cobrado no pedido",
            type: "switch",
            options: [
              {
                value: "true",
                label:
                  "Esta fábrica não traz IPI na tabela — o IPI é lançado por item no pedido",
              },
            ],
          },
        ],
      },
    ],
  },
];

/** Valor em reais vindo do formulário. Vazio, inválido ou zero viram `null` —
 * "sem piso" e "piso de zero reais" precisam ser a mesma coisa em toda a
 * cadeia, do formulário ao `shortfall` no backend. */
const toAmountOrNull = (value: unknown): number | null => {
  const raw = String(value ?? "").trim();
  if (raw === "") return null;
  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

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

  // Corte do faturamento: vazio → null (fábrica sem corte); 1-31 → grava.
  // Fora da faixa é descartado aqui e barrado no backend — não adianta gravar
  // "dia 45" e a comissão nunca fechar.
  const rawCutoff = String(data.commissionCutoffDay ?? "").trim();
  const parsedCutoff = rawCutoff === "" ? null : Number(rawCutoff);
  const cutoffDay =
    parsedCutoff !== null &&
    Number.isFinite(parsedCutoff) &&
    parsedCutoff >= 1 &&
    parsedCutoff <= 31
      ? Math.round(parsedCutoff)
      : null;
  if (cutoffDay !== (initial.commissionCutoffDay ?? null)) {
    input.commissionCutoffDay = cutoffDay;
  }

  // Vazio grava "Faturamento" (o padrão) em vez de deixar o campo intocado:
  // quem abre o select e limpa está dizendo que conta da nota.
  const dueBasis =
    (data.installmentDueBasis as { value: string } | null)?.value ||
    "Faturamento";
  if (dueBasis !== (initial.installmentDueBasis ?? "Faturamento")) {
    input.installmentDueBasis = dueBasis;
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

  const ipiInOrder =
    Array.isArray(data.ipiInOrder) && data.ipiInOrder.includes("true");
  if (ipiInOrder !== initial.ipiInOrder) {
    input.ipiInOrder = ipiInOrder;
  }

  // Prazo de entrega: vazio → null (limpa o padrão); número válido → grava.
  const rawDays = String(data.deliveryEstimateDays ?? "").trim();
  const parsedDelivery = rawDays === "" ? null : Number(rawDays);
  const deliveryDays =
    parsedDelivery !== null &&
    Number.isFinite(parsedDelivery) &&
    parsedDelivery >= 0
      ? Math.round(parsedDelivery)
      : null;
  if (deliveryDays !== (initial.deliveryEstimateDays ?? null)) {
    input.deliveryEstimateDays = deliveryDays;
  }

  // Os dois pisos de valor. Vazio ou zero → null ("esta fábrica não tem piso"),
  // e não R$ 0,00 — senão a tela leria de volta um mínimo que não existe.
  for (const field of ["minOrderAmount", "freeFreightCifAmount"] as const) {
    const amount = toAmountOrNull(data[field]);
    if (amount !== (initial[field] ?? null)) {
      input[field] = amount;
    }
  }

  return input;
};
