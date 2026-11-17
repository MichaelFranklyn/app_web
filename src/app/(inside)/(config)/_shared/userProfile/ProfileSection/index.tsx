import { Grid } from "@/components/Grid";
import { Title } from "@/components/Title";
import { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  /**
   * 2 põe os cards lado a lado no desktop; 1 empilha blocos largos (rotina,
   * fábricas, carteira), que têm tabela e não cabem em meia linha.
   */
  columns?: 1 | 2;
  children: ReactNode;
}

/**
 * Um grupo de cards do perfil com título e uma linha dizendo para que serve.
 * Separar por assunto (dados, acesso, rotina, carteira) evita a fila solta de
 * caixas, em que a pessoa precisava ler todas para achar a que queria.
 */
export function ProfileSection({
  title,
  description,
  columns = 2,
  children,
}: Props) {
  return (
    <section className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <Title variant="heading-sm" weight="semibold" as="h2">
          {title}
        </Title>
        <Title variant="body-sm" color="muted">
          {description}
        </Title>
      </div>

      {columns === 2 ? (
        <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
          {children}
        </Grid.Root>
      ) : (
        <div className="flex flex-col gap-16">{children}</div>
      )}
    </section>
  );
}
