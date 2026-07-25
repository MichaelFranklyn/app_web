"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Settings2, SlidersHorizontal } from "lucide-react";
import { EditCardAction } from "../../dataCards";
import { ProfileSeller } from "../interface";
import { RoutineEditor } from "./RoutineEditor";
import { RoutineSummary } from "./RoutineSummary";
import { useRoutineCardForm } from "./useRoutineCardForm";

interface Props {
  seller: ProfileSeller;
  onRefetch: () => void;
}

/**
 * Rotina de visitas do vendedor, lida e editada no MESMO card: "Ajustar rotina"
 * troca os valores pelos controles ali mesmo, sem levar a pessoa para outra tela.
 *
 * São os parâmetros do dia a dia — os que a pessoa reconhece. Os pesos que
 * ordenam as visitas não têm tela: entram com o padrão quando a config é criada.
 */
export function RoutineSection({ seller, onRefetch }: Props) {
  const {
    config,
    form,
    isEditing,
    isLoading,
    patch,
    startEditing,
    cancelEditing,
    save,
  } = useRoutineCardForm({ seller, onSaved: onRefetch });

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>Rotina de visitas</Card.Header.Title>
        <Card.Header.Description>
          {config
            ? "Parâmetros que o sistema usa para montar a agenda de visitas."
            : "Ainda não configurada: sem estes parâmetros o sistema não monta a agenda de visitas. Comece pelos valores sugeridos abaixo e ajuste o que precisar."}
        </Card.Header.Description>
        {/* Sem config o card já abre em edição: o botão do rodapé é o único
                caminho, e repetir "Configurar rotina" aqui só dividiria a atenção. */}
        {!isEditing && config && (
          <Card.Header.Actions>
            <EditCardAction title="Ajustar rotina" onClick={startEditing} />
          </Card.Header.Actions>
        )}
      </Card.Header>

      {isEditing || !config ? (
        <RoutineEditor form={form} disabled={isLoading} onChange={patch} />
      ) : (
        <RoutineSummary config={config} />
      )}

      {(isEditing || !config) && (
        <Card.Footer className="justify-end gap-8">
          {config && (
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
              onClick={cancelEditing}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          )}
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={save}
          >
            <Button.Icon icon={config ? SlidersHorizontal : Settings2} />
            <Button.Title>
              {config ? "Salvar rotina" : "Configurar rotina"}
            </Button.Title>
          </Button.Root>
        </Card.Footer>
      )}
    </Card.Root>
  );
}
