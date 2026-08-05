import { toUtcIsoDate } from "@/utils/format/date";
import { DateRangeIso } from "../interface";

// Os formatadores (mês no eixo, porcentagem, dias, contagem) subiram para o pai
// quando `reports/` passou a precisar deles — ver `dashboard/utils.tsx`. Ficam
// re-exportados aqui porque os ~29 gráficos desta aba já os consomem por este
// caminho; o que importa é existir UMA implementação (mesma regra de
// `commissions/utils.ts` com os helpers de mês).
export {
  formatCount,
  formatDays,
  formatPercent,
  monthKeyToLabel,
} from "../utils";

/** Período default dos gráficos: início do mês 11 meses atrás → hoje (12 meses). */
export const getLast12MonthsRangeIso = (): DateRangeIso => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  return {
    from: toUtcIsoDate(
      new Date(Date.UTC(start.getFullYear(), start.getMonth(), 1))
    ),
    to: toUtcIsoDate(
      new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    ),
  };
};
