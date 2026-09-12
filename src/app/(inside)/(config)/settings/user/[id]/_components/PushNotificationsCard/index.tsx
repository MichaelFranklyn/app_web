"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { BellOff, BellRing } from "lucide-react";

import { usePushNotifications } from "@/services/push";

/**
 * Liga o aviso no celular (ou no computador) DESTE aparelho.
 *
 * É por aparelho, e não por conta, porque quem entrega o aviso é o navegador em
 * que a pessoa autorizou: o mesmo usuário pode querer receber no celular que
 * leva para a rua e não no computador do escritório. Por isso o card só aparece
 * no próprio perfil — ninguém autoriza aviso no aparelho de outra pessoa.
 *
 * O card some inteiro quando o servidor não tem push configurado: oferecer um
 * botão que inscreve o aparelho e nunca entrega nada é pior que não ter botão.
 */
export function PushNotificationsCard() {
  const { status, isLoading, enable, disable, unsupportedHint } =
    usePushNotifications();

  if (status === "disabled") return null;

  return (
    <Card.Root className="desktop:col-span-2">
      <Card.Header>
        <Card.Header.Title>Avisos neste aparelho</Card.Header.Title>
        <Card.Header.Description>
          Receba um aviso na tela do celular quando algo acontecer — mesmo com o
          Girus fechado.
        </Card.Header.Description>
        <Card.Header.Actions>
          <HelpTooltip
            label="Como funcionam os avisos"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Um aparelho de cada vez
                </Title>
                <Title variant="body-sm">
                  São os mesmos avisos do sininho: pedido faturado, visita
                  atrasada, importação concluída.
                </Title>
                <Title variant="body-sm" color="muted">
                  A autorização vale só para o aparelho em que você ativar. Se
                  usa o Girus no celular e no computador, ative nos dois.
                </Title>
              </div>
            }
          />
        </Card.Header.Actions>
      </Card.Header>

      <Card.Body className="flex flex-col items-start gap-12">
        {status === "loading" && (
          <Loading.Skeleton className="h-16 w-[220px]" />
        )}

        {status === "unsupported" && (
          <Title variant="body-sm" color="muted">
            {unsupportedHint}
          </Title>
        )}

        {status === "blocked" && (
          <Title variant="body-sm" color="muted">
            Os avisos estão bloqueados neste navegador. Toque no cadeado ao lado
            do endereço do site, permita as notificações e volte aqui.
          </Title>
        )}

        {status === "off" && (
          <>
            <Title variant="body-sm" color="muted">
              Ao ativar, o navegador vai perguntar se você permite os avisos.
              Responda “Permitir”.
            </Title>
            <Button.Root
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              loading={isLoading}
              onClick={enable}
            >
              <Button.Icon icon={BellRing} />
              <Button.Title>Ativar avisos neste aparelho</Button.Title>
            </Button.Root>
          </>
        )}

        {status === "on" && (
          <>
            <Title variant="body-sm" color="muted">
              Este aparelho já recebe os avisos.
            </Title>
            <Button.Root
              appearance="outline"
              color="neutral"
              size="md"
              noUppercase
              loading={isLoading}
              onClick={disable}
            >
              <Button.Icon icon={BellOff} />
              <Button.Title>Desligar neste aparelho</Button.Title>
            </Button.Root>
          </>
        )}
      </Card.Body>
    </Card.Root>
  );
}
