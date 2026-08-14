import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import {
  FEATURE_DESCRIPTION,
  FEATURE_LABEL,
  FEATURE_ORDER,
} from "@/services/plan";

/**
 * O que cada recurso significa em telas do sistema.
 *
 * A comparação acima diz QUAIS planos têm "Rotina de visitas"; aqui se diz o que
 * o cliente deixa de ver sem ela. Sem este glossário, quem atende teria de
 * decorar a fronteira de cada recurso — e a resposta errada no telefone vira
 * promessa que o sistema não cumpre.
 */
export function FeatureGlossary() {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          O que cada recurso libera
        </Card.Header.Title>
        <Card.Header.Description>
          Sem o recurso no plano, a empresa não vê o menu e a API recusa a
          operação — com a mensagem de plano, não de permissão.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-col gap-12">
          {FEATURE_ORDER.map((feature) => (
            <div key={feature} className="flex flex-col gap-[2px]">
              <Title variant="caption" weight="semibold">
                {FEATURE_LABEL[feature]}
              </Title>
              <Title variant="micro" color="muted">
                {FEATURE_DESCRIPTION[feature]}
              </Title>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
