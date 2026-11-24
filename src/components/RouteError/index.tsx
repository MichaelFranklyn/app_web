import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";

interface RouteErrorProps {
  /** Ícone do lucide, já com o tamanho (36). */
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  /** As saídas: "Tentar novamente", "Ir para o início"... */
  children?: React.ReactNode;
}

/**
 * Tela cheia de erro para as rotas SEM casca de app: portal do cliente, login e
 * cadastro, página inexistente e o `global-error`. Mesma moldura do
 * `LinkExpired`: quem chega aqui não tem sidebar nem topbar para se orientar,
 * então o recado precisa ocupar a tela e trazer a saída junto.
 *
 * Sem hook nem `"use client"`: serve tanto ao `not-found.tsx` (servidor) quanto
 * aos `error.tsx` (cliente), que passam os botões prontos.
 */
export function RouteError({
  icon,
  title,
  description,
  children,
}: RouteErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-16">
      <EmptyState.Root className="max-w-[420px]">
        <EmptyState.Icon>{icon}</EmptyState.Icon>
        {/* `as="span"`: `EmptyState.Title` JÁ é o <h3>. */}
        <EmptyState.Title>
          <Title variant="heading-md" as="span">
            {title}
          </Title>
        </EmptyState.Title>
        <EmptyState.Description className="max-w-[320px]">
          {description}
        </EmptyState.Description>
        {children && <EmptyState.Actions>{children}</EmptyState.Actions>}
      </EmptyState.Root>
    </div>
  );
}
