import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { RowList } from "@/components/RowList";
import { Title } from "@/components/Title";
import { plural } from "@/utils/format/plural";
import { CheckCircle2 } from "lucide-react";
import { AttentionItem } from "../../interface";
import { SEVERITY_COLOR, SEVERITY_LABEL } from "../../utils";
import { ICON_SIZE } from "@/components/Icon";

/**
 * O que exige decisão agora — o primeiro bloco da tela.
 *
 * Os outros painéis descrevem a plataforma; este manda fazer alguma coisa. Por
 * isso abre a página: quem entra no console geralmente entra por um motivo, e
 * o motivo costuma estar aqui.
 *
 * Não há "marcar como resolvido": cada item nasce de uma condição no banco e
 * some quando ela deixa de valer. Um botão de dispensar criaria um segundo
 * estado que poderia mentir sobre o primeiro.
 */
export function AttentionQueue({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <Card.Root>
        <Card.Body className="items-center">
          <CheckCircle2
            size={ICON_SIZE.lg}
            className="shrink-0 text-(--color-status-success)"
          />
          <div className="flex flex-col gap-2">
            <Title variant="body-sm" weight="semibold">
              Nada exigindo atenção
            </Title>
            <Title variant="micro" color="muted">
              Nenhum teste vencendo, nenhuma conta parada e nenhuma empresa sem
              primeiro acesso.
            </Title>
          </div>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>Precisa de atenção</Card.Header.Title>
        <Card.Header.Description>
          {plural(items.length, "item", "itens")} · o mais grave primeiro. Some
          sozinho quando a situação se resolve.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        <RowList.Root>
          {items.map((item, index) => (
            // Cada item leva à ficha onde a decisão é tomada. Sem empresa
            // (pendência da própria plataforma), fica sem link.
            <RowList.Item
              key={`${item.kind}-${item.companyId ?? index}`}
              href={
                item.companyId
                  ? `/platform/companies/${item.companyId}`
                  : undefined
              }
            >
              <div className="flex flex-wrap items-baseline gap-8">
                <Badge.Root
                  color={SEVERITY_COLOR[item.severity]}
                  appearance="tinted"
                  size="xs"
                >
                  <Badge.Text>{SEVERITY_LABEL[item.severity]}</Badge.Text>
                </Badge.Root>
                <Title variant="body-sm" weight="semibold">
                  {item.companyName ?? "Plataforma"}
                </Title>
                <Title variant="micro" color="muted">
                  {item.detail}
                </Title>
              </div>
            </RowList.Item>
          ))}
        </RowList.Root>
      </Card.Body>
    </Card.Root>
  );
}
