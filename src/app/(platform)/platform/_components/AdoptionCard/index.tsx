import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { Progress } from "@/components/Progress";
import { FeatureAdoption } from "../../interface";
import { adoptionRate } from "../../utils";

/** Faixa de cor por nível de adoção. O vermelho é o achado que interessa:
 * funcionalidade construída que ninguém usa. */
const barColor = (percent: number): "green" | "amber" | "red" => {
  if (percent >= 70) return "green";
  if (percent >= 35) return "amber";
  return "red";
};

/**
 * Que partes do sistema as empresas realmente usam.
 *
 * A ordem segue o caminho de adoção — fábricas, clientes, preços, pedidos,
 * rotina, importação, metas —, não o alfabeto. Lida de cima para baixo, a
 * lista mostra ONDE a adoção trava: a primeira barra curta é o degrau em que
 * as empresas param.
 *
 * "Usar" aqui é ter registro vivo, não ter clicado. É o que dá para medir sem
 * telemetria, e já responde a pergunta cara: o que foi construído à toa.
 */
export function AdoptionCard({ features }: { features: FeatureAdoption[] }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Adoção por funcionalidade
        </Card.Header.Title>
        <Card.Header.Description>
          Quantas empresas ativas têm dado em cada parte do sistema, na ordem em
          que costumam adotar.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        <ul className="flex flex-col gap-12">
          {features.map((feature) => {
            const percent = adoptionRate(feature);
            return (
              <li key={feature.feature} className="flex flex-col gap-[4px]">
                <div className="flex items-baseline justify-between gap-8">
                  <Title variant="body-sm">{feature.label}</Title>
                  <Title variant="micro" color="muted">
                    {feature.tenantsUsing} de {feature.totalTenants} · {percent}
                    %
                  </Title>
                </div>
                <Progress.Bar
                  value={percent}
                  color={barColor(percent)}
                  aria-label={`Adoção de ${feature.label}`}
                />
              </li>
            );
          })}
        </ul>
      </Card.Body>
    </Card.Root>
  );
}
