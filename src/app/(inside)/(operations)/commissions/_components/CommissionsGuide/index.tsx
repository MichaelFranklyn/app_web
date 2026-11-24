"use client";

import { Button } from "@/components/Button";
import { Drawer } from "@/components/Drawer";
import { Title } from "@/components/Title";
import { BookOpen } from "lucide-react";
import { useState } from "react";

import { guideSections } from "../../help";

interface Props {
  /** Gestor: entram as partes que só ele vê (ótica, repartição). */
  canManage: boolean;
}

/**
 * "Como isto é calculado": a explicação da tela inteira num lugar só.
 *
 * Antes eram cerca de dez "?" espalhados — um por cartão, um por botão —, e a
 * tela de comissões virava um campo de interrogações. Quem confere o mês todo
 * dia não precisa delas; quem chega pela primeira vez prefere ler de uma vez,
 * na ordem da tela, a caçar ícone por ícone.
 *
 * É um botão no cabeçalho que abre um painel lateral, e não um cartão fechado
 * entre o título e os números: o cartão empurrava a lista ~100px para baixo
 * em toda visita, para uma leitura que se faz uma vez (crítica de
 * /commissions, 23/11/2026).
 */
export function CommissionsGuide({ canManage }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button.Root
        appearance="outline"
        color="neutral"
        size="sm"
        className="shrink-0"
        label="Como é calculado"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-testid="commissions-guide"
        onClick={() => setOpen(true)}
      >
        <Button.Icon icon={BookOpen} />
        {/* No celular, só o ícone: com o rótulo, o botão espremia o título
            "Comissões" e a descrição numa coluna estreita. */}
        <Button.Title className="max-tablet:hidden">
          Como é calculado
        </Button.Title>
      </Button.Root>
      <Drawer.Root
        open={open}
        onClose={() => setOpen(false)}
        label="Como isto é calculado"
        unmountOnClose
      >
        <Drawer.Header>
          <Title variant="heading-sm">Como isto é calculado</Title>
        </Drawer.Header>
        <Drawer.Body className="gap-20">
          {guideSections(canManage).map((section) => (
            <section key={section.title} className="flex flex-col gap-6">
              <Title variant="body-md" weight="semibold">
                {section.title}
              </Title>
              {section.body}
            </section>
          ))}
        </Drawer.Body>
      </Drawer.Root>
    </>
  );
}
