"use client";

import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Title } from "@/components/Title";
import { companyInitials } from "@/utils/company";
import { mediaUrl } from "@/utils/media";
import { EditCardAction } from "../../../../_shared/dataCards";
import { MyCompany } from "../../interface";

interface Props {
  company: MyCompany;
  onEdit: () => void;
}

/**
 * As duas imagens em leitura. Aqui o "valor do campo" é a própria imagem — mostrar
 * o que está no ar hoje é o que deixa claro se vale trocar.
 */
export function CompanyBrandCard({ company, onEdit }: Props) {
  const initials = companyInitials(company.nomeFantasia ?? company.razaoSocial);

  return (
    // Duas colunas: num card estreito o cabeçalho colapsa e o botão de ação vira
    // uma barra de largura cheia, que lê como "salvar a página".
    <Card.Root className="desktop:col-span-2">
      <Card.Header>
        <Card.Header.Title>Marca da empresa</Card.Header.Title>
        <Card.Header.Description>
          A logo completa vai no PDF que você envia ao cliente; o símbolo
          identifica a empresa no topo do sistema.
        </Card.Header.Description>
        <Card.Header.Actions>
          <EditCardAction title="Trocar imagens" onClick={onEdit} />
        </Card.Header.Actions>
      </Card.Header>

      <Card.Body>
        <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
          <div className="flex flex-col gap-8">
            <Title
              variant="micro"
              color="muted"
              className="tracking-[0.08em] uppercase"
            >
              Logo completa
            </Title>
            {company.logoUrl ? (
              // O backend devolve caminho relativo (/media/...); quem prefixa com
              // a origem da API é o front. Sem isso a imagem não carrega.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl(company.logoUrl)}
                alt={`Logo de ${company.nomeFantasia ?? company.razaoSocial}`}
                className="h-[56px] max-w-full self-start object-contain"
              />
            ) : (
              <Title variant="body" color="muted">
                Nenhuma logo enviada
              </Title>
            )}
          </div>

          <div className="flex flex-col gap-8">
            <Title
              variant="micro"
              color="muted"
              className="tracking-[0.08em] uppercase"
            >
              Símbolo
            </Title>
            <Avatar
              size="lg"
              color="amber"
              initials={initials}
              src={mediaUrl(company.avatarUrl ?? company.logoUrl)}
            />
          </div>
        </Grid.Root>
      </Card.Body>
    </Card.Root>
  );
}
