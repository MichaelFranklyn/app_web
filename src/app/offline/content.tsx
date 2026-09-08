"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { sondarServidor } from "./utils";

/**
 * Cliente porque a página tem uma coisa a fazer: descobrir quando dá para voltar.
 *
 * **Por que ela SONDA o servidor em vez de ler `navigator.onLine`.** Aquela
 * propriedade responde "existe uma interface de rede?", não "a internet
 * funciona". Wi-fi de loja conectado e sem saída aparece como online; servidor
 * fora do ar, idem. Testado: com o servidor derrubado e o wi-fi de pé, a versão
 * que confiava no `onLine` anunciava "a internet voltou, toque para continuar",
 * a pessoa tocava, falhava outra vez — e a mensagem perdia a credibilidade
 * exatamente como o "tente em 0 minutos" que o freio de login evita.
 *
 * Então `onLine` entra só como GATILHO (é de graça e avisa na hora em que o
 * sistema operacional reconecta), e quem dá o veredicto é uma requisição de
 * verdade. Enquanto não volta, uma sondagem a cada 5s: quem está esperando o
 * sinal não deveria ter de tocar na tela para descobrir.
 *
 * Voltar é `location.reload()` e não `router.refresh()`: quem chegou aqui foi
 * desviado da rota que queria (a URL na barra ainda é a de origem, o service
 * worker só trocou o conteúdo), e o refresh do Next recarregaria ESTA página. O
 * reload repete a navegação original.
 */
type Estado = "offline" | "checando" | "voltou";

const INTERVALO_DE_SONDAGEM_MS = 5000;

export function OfflineContent() {
  const [estado, setEstado] = useState<Estado>("offline");

  useEffect(() => {
    let vivo = true;

    const aplicar = (novo: Estado) => {
      if (vivo) setEstado(novo);
    };

    const checar = async () => {
      // `onLine` falso é definitivo: sem interface de rede não há o que sondar,
      // e a requisição só gastaria tempo para falhar.
      if (!navigator.onLine) {
        aplicar("offline");
        return;
      }
      aplicar("checando");
      aplicar((await sondarServidor()) ? "voltou" : "offline");
    };

    checar();

    // Sonda SEMPRE, inclusive depois de anunciar que voltou. A primeira versão
    // parava ali ("dali em diante a decisão é da pessoa") e a tela passava a
    // mentir: com a conexão indo e voltando — que é a vida dentro de uma loja —
    // ela ficava presa no "pode continuar" enquanto a rede já tinha caído de
    // novo. Testado derrubando o servidor com a tela aberta. Uma requisição
    // HEAD de poucos bytes a cada 5s, numa tela que fica aberta pouco tempo, é
    // barato demais para justificar uma tela que engana.
    const timer = setInterval(checar, INTERVALO_DE_SONDAGEM_MS);

    // `online`/`offline` como gatilho: encurta a espera de até 5s para ~0.
    window.addEventListener("online", checar);
    window.addEventListener("offline", checar);

    return () => {
      vivo = false;
      clearInterval(timer);
      window.removeEventListener("online", checar);
      window.removeEventListener("offline", checar);
    };
  }, []);

  const voltou = estado === "voltou";

  return (
    <div className="flex min-h-screen items-center justify-center px-[16px]">
      <EmptyState.Root className="max-w-[420px]">
        <EmptyState.Icon>
          <WifiOff size={36} />
        </EmptyState.Icon>
        <EmptyState.Title>
          <Title variant="heading-md">Sem conexão</Title>
        </EmptyState.Title>
        <EmptyState.Description className="max-w-[340px]">
          {voltou
            ? "A conexão voltou. Toque no botão para continuar de onde parou."
            : "Seu celular está sem internet agora. O app volta a funcionar assim que o sinal aparecer — não precisa fechar nem tentar de novo, esta tela avisa sozinha."}
        </EmptyState.Description>
        <EmptyState.Actions>
          {/* Âmbar só quando a ação vale a pena. Enquanto não voltou o botão
              continua ali (quem quiser insistir, insiste), mas discreto: é o
              que evita prometer o que a rede não cumpre. */}
          <Button.Root
            appearance={voltou ? "solid" : "outline"}
            color={voltou ? "amber" : "neutral"}
            loading={estado === "checando"}
            onClick={() => window.location.reload()}
          >
            <Button.Title>
              {voltou ? "Continuar" : "Tentar de novo"}
            </Button.Title>
          </Button.Root>
        </EmptyState.Actions>
      </EmptyState.Root>
    </div>
  );
}
