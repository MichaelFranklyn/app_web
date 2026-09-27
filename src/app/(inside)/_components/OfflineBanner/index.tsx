"use client";
import { Emphasis } from "@/components/Emphasis";
import { Banner } from "@/components/Banner";

import { Title } from "@/components/Title";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Faixa no topo enquanto o aparelho está sem internet.
 *
 * Por que ela é necessária mesmo tendo a página offline: aquela só aparece
 * quando a pessoa NAVEGA sem rede. O caso mais comum dentro da loja é outro —
 * o app já está aberto, e o sinal cai. Aí o botão de salvar simplesmente não
 * responde, o toast de erro fala de "falha ao carregar", e a conclusão natural
 * é que o sistema está com defeito. A faixa nomeia a causa.
 *
 * O texto separa o que se pode e o que não se pode fazer, e isso é deliberado:
 * visita e estoque ficam guardados no aparelho e vão sozinhos quando o sinal
 * volta (`@/services/offlineQueue`); pedido NÃO — enviado mais tarde ele teria
 * de reconferir preço e piso contra um catálogo que pode ter mudado (ver o
 * cabeçalho de `public/sw.js`). Avisar antes é mais honesto que deixar a pessoa
 * digitar trinta itens para descobrir no fim.
 *
 * `navigator.onLine` é otimista — ele diz que há uma interface de rede, não que
 * a internet responde —, então um wi-fi de loja conectado e sem saída aparece
 * como online. Isso torna a faixa um piso, não uma garantia: quando ela
 * aparece, está offline com certeza; quando não aparece, pode estar.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // O estado inicial vem do efeito: ler `navigator` no render quebraria o SSR,
    // e assumir `false` no primeiro paint evita o flash da faixa em quem está
    // online (que é quase todo mundo, quase sempre).
    setOffline(!navigator.onLine);

    const online = () => setOffline(false);
    const perdeu = () => setOffline(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", perdeu);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", perdeu);
    };
  }, []);

  if (!offline) return null;

  return (
    <Banner
      tone="red"
      icon={WifiOff}
      // `role="status"` e não `alert`: leitor de tela anuncia sem interromper o
      // que a pessoa está fazendo, que é o certo para uma condição contínua.
      role="status"
      data-testid="offline-banner"
    >
      <Title variant="body-xs" color="inverse">
        Sem internet agora. Visita e estoque que você marcar ficam guardados e
        vão sozinhos quando o sinal voltar. <Emphasis>Pedido, não</Emphasis>:
        para criar, espere o sinal — a faixa desaparece sozinha.
      </Title>
    </Banner>
  );
}
