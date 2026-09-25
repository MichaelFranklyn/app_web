import type { ThemeColor } from "@/lib/theme";
import { HygieneReason } from "./interface";

/**
 * Por que o cliente está na lista, em palavras de quem decide. Cada motivo diz
 * o sinal E o que ele costuma querer dizer — o usuário decide, o sistema só
 * aponta. As réguas (um ano, seis meses) são as do backend
 * (`company_clients/repository.py`): mudar lá sem mudar aqui mentiria.
 */
export const HYGIENE_REASON: Record<
  HygieneReason,
  { label: string; help: string; color: ThemeColor }
> = {
  RECEITA_INACTIVE: {
    label: "CNPJ fora de operação",
    help: "A Receita Federal diz que este CNPJ não está ativo (baixado, inapto ou suspenso). Em geral, o cliente fechou ou mudou de CNPJ.",
    color: "red",
  },
  NO_RECENT_PURCHASE: {
    label: "Sem compra há mais de 1 ano",
    help: "Já comprou, mas o último pedido tem mais de um ano. Pode ter fechado, trocado de fornecedor ou só estar parado.",
    color: "amber",
  },
  NEVER_BOUGHT: {
    label: "Nunca comprou",
    help: "Está na carteira há mais de seis meses e nunca fez um pedido.",
    color: "neutral",
  },
};

export const RECEITA_HELP =
  "A situação cadastral vem da Receita Federal. As consultas são gratuitas, mas limitadas por minuto: por isso a conferência é feita em lotes de 10.";
