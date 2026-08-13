import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { AttentionItem } from "../../interface";
import { SEVERITY_COLOR, SEVERITY_LABEL } from "../../utils";

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
        <Card.Body className="flex items-center gap-12">
          <CheckCircle2 size={20} className="shrink-0 text-(--green)" />
          <div className="flex flex-col gap-[2px]">
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
        <Card.Header.Title size="sm" weight="semibold">
          Precisa de atenção
        </Card.Header.Title>
        <Card.Header.Description>
          {items.length} {items.length === 1 ? "item" : "itens"} · o mais grave
          primeiro. Some sozinho quando a situação se resolve.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        <ul className="flex flex-col gap-8">
          {items.map((item, index) => {
            const row = (
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
            );

            return (
              <li
                key={`${item.kind}-${item.companyId ?? index}`}
                className="border-b border-(--border) pb-8 last:border-0 last:pb-0"
              >
                {/* Cada item leva à ficha onde a decisão é tomada. Sem empresa
                    (pendência da própria plataforma), fica sem link. */}
                {item.companyId ? (
                  <Link
                    href={`/platform/companies/${item.companyId}`}
                    className="block transition-opacity hover:opacity-70"
                  >
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </li>
            );
          })}
        </ul>
      </Card.Body>
    </Card.Root>
  );
}
