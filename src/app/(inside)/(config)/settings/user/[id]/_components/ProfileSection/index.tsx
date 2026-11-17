import { Grid } from "@/components/Grid";
import { Title } from "@/components/Title";
import { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * Um grupo de cards do perfil com título e uma linha dizendo para que serve.
 * Separar por assunto (dados, acesso, notificações) evita a grade solta de
 * seis caixas, em que a pessoa precisava ler todas para achar a que queria.
 */
export function ProfileSection({ title, description, children }: Props) {
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

      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
        {children}
      </Grid.Root>
    </section>
  );
}
