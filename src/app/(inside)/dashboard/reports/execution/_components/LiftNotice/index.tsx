import { Alert } from "@/components/Alert";
import { Info, TriangleAlert } from "lucide-react";

import { formatPercent } from "../../../../utils";
import { VisitExecutionReport } from "../../interface";
import { MIN_EXECUTION_FOR_LIFT } from "../../utils";

interface Props {
  report: VisitExecutionReport;
}

/**
 * O que a tela permite concluir sobre o motor.
 *
 * Com a rotina parada, o lift sai baixo POR ACERTO do score (ele aponta quem
 * parou de comprar, e ninguém foi lá) — mostrar o número sozinho levaria o
 * gestor a desconfiar do motor, que é a conclusão errada. Por isso, abaixo da
 * régua, o aviso fala de execução e o lift nem aparece.
 */
export function LiftNotice({ report }: Props) {
  if (report.planned === 0) return null;

  if (!report.isLiftReliable) {
    return (
      <Alert.Root variant="warning">
        <Alert.Icon icon={TriangleAlert} />
        <Alert.Content>
          <Alert.Title>A rotina quase não está sendo registrada</Alert.Title>
          <Alert.Description>
            Só {formatPercent(report.executionRate)} das visitas planejadas
            tiveram resposta. Abaixo de {formatPercent(MIN_EXECUTION_FOR_LIFT)}{" "}
            não dá para saber se a rotina escolhe bem os clientes: o sistema
            aprende com cada visita marcada como feita, com cliente ausente ou
            sem tempo.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  if (report.lift == null) return null;

  return (
    <Alert.Root variant="info">
      <Alert.Icon icon={Info} />
      <Alert.Content>
        <Alert.Description>
          Os clientes que a rotina indicou compraram{" "}
          {report.lift.toFixed(1).replace(".", ",")}× mais do que a carteira
          compraria sozinha no mesmo período (
          {formatPercent(report.conversionRate)} contra{" "}
          {formatPercent(report.baselineRate)}).
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
