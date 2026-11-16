"use client";

import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { useState, useSyncExternalStore } from "react";
import { ScreenFrame } from "../../../ScreenFrame";

/** Tempo de cada tela antes de a vitrine passar para a próxima. */
const SLIDE_MS = 6000;

const SCREENS = [
  {
    key: "rota",
    label: "Rota do dia",
    caption:
      "A ordem das visitas, o horário e a prioridade de cada cliente — e quem entra como ligação.",
    image: "/marketing/rota-do-dia.webp",
    alt: "Rota do dia no Itinus: as visitas numeradas com horário, cliente e prioridade, seguidas das ligações do dia com os botões Ligar e WhatsApp.",
  },
  {
    key: "agenda",
    label: "Semana da equipe",
    caption:
      "Visitas e ligações de cada dia num quadro só, sem perguntar a ninguém onde cada um está.",
    image: "/marketing/agenda-semana.webp",
    alt: "Agenda da semana: total de visitas e contatos no topo e os cartões de cada dia, de terça a sexta.",
  },
  {
    key: "pedidos",
    label: "Pedidos",
    caption:
      "Tudo o que a equipe vendeu, por situação: em aberto, faturado, entregue.",
    image: "/marketing/pedidos.webp",
    alt: "Lista de pedidos com o total vendido, o faturado e a comissão no topo, e cada pedido com cliente, fábrica, valor e situação.",
  },
  {
    key: "comissoes",
    label: "Comissões",
    caption:
      "O que cada fábrica deve no mês, parcela por parcela, com a conferência marcada.",
    image: "/marketing/comissoes.webp",
    alt: "Comissões do mês: a receber, previsto e recebido, e as parcelas agrupadas por fábrica.",
  },
  {
    key: "oportunidades",
    label: "Oportunidades",
    caption:
      "Clientes no momento de recomprar e prioritários que ficaram fora da rota.",
    image: "/marketing/oportunidades.webp",
    alt: "Oportunidades: clientes no momento de recomprar e clientes prioritários fora da rotina.",
  },
];

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * A primeira dobra em movimento (14/11/2026): o produto se apresenta sozinho,
 * tela por tela, em vez de um print parado.
 *
 * A troca é guiada pela PRÓPRIA barra de progresso: quando a animação dela
 * termina, a vitrine avança. Um só relógio — sem `setInterval` correndo de um
 * lado e a barra do outro, descasando depois de uma aba em segundo plano.
 *
 * Para quando o leitor está olhando (mouse em cima ou foco dentro) e de vez
 * quando ele escolhe uma tela: depois disso quem manda é ele. Com movimento
 * reduzido, nunca anda — a regra global zera a duração das animações, e a
 * barra "terminaria" no mesmo instante, girando as telas sem parar.
 *
 * No servidor a vitrine nasce parada na primeira tela (`getServerSnapshot`
 * diz "movimento reduzido"): a rota continua estática e o HTML é o mesmo do
 * print fixo de antes.
 *
 * Abaixo do `tablet` só aparece o celular, que é a tela do vendedor na rua;
 * os botões somem junto, porque não haveria o que trocar.
 */
export function HeroShowcase() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true
  );

  const isRunning = isAutoplay && !prefersReducedMotion;
  const screen = SCREENS[active];

  const choose = (index: number) => {
    setActive(index);
    setIsAutoplay(false);
  };

  return (
    <div
      className="flex flex-col gap-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div
        role="group"
        aria-label="Telas do Itinus"
        className="tablet:flex hidden flex-wrap gap-8"
      >
        {SCREENS.map((item, index) => {
          const isActive = index === active;

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => choose(index)}
              className={cn(
                "relative overflow-hidden rounded-(--radius-full) border px-16 py-8 transition",
                isActive
                  ? "border-(--amber-bd) bg-(--amber-bg)"
                  : "border-(--color-border-control) bg-(--bg2) hover:bg-(--bg3)"
              )}
            >
              <Title
                as="span"
                variant="body-sm"
                weight="semibold"
                color={isActive ? "amber" : "secondary"}
              >
                {item.label}
              </Title>

              {isActive && isRunning && (
                <span
                  aria-hidden
                  // `key` reinicia a barra a cada tela; o fim dela é o relógio.
                  key={item.key}
                  onAnimationEnd={() =>
                    setActive((current) => (current + 1) % SCREENS.length)
                  }
                  className="absolute inset-x-0 bottom-0 h-2 origin-left bg-(--color-action)"
                  style={{
                    animation: `fill-x ${SLIDE_MS}ms linear both`,
                    animationPlayState: isPaused ? "paused" : "running",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* A legenda fica entre os botões e o print: embaixo, o celular
          sobreposto a cobria. Só é anunciada quando o LEITOR troca a tela —
          na troca automática, falaria a cada seis segundos. */}
      <Title
        key={screen.key}
        variant="body-sm"
        color="secondary"
        aria-live={isAutoplay ? "off" : "polite"}
        className="tablet:block animate-fade-in hidden max-w-[60ch]"
      >
        <strong>{screen.label}.</strong> {screen.caption}
      </Title>

      {/* A partir do tablet, o celular sobrepõe o canto do computador. */}
      <div className="tablet:block tablet:pr-[96px] relative flex justify-center">
        {/* As telas empilhadas na mesma célula do grid trocam por opacidade:
            a altura nunca pula, porque todas têm a mesma proporção. */}
        <div className="tablet:grid hidden">
          {SCREENS.map((item, index) => (
            <div
              key={item.key}
              aria-hidden={index !== active}
              className={cn(
                "transition-[opacity,transform] duration-500 [grid-area:1/1]",
                index === active
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-8 opacity-0"
              )}
            >
              <ScreenFrame
                src={item.image}
                alt={item.alt}
                sizes="(min-width: 1200px) 1056px, 100vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        <ScreenFrame
          device="phone"
          src="/marketing/rota-celular.webp"
          alt="A rota do dia no celular do vendedor: dia, cliente de cada visita e o selo de urgência."
          sizes="(min-width: 760px) 200px, 240px"
          priority
          className="tablet:absolute tablet:right-0 tablet:-bottom-32 tablet:w-[200px] w-[240px]"
        />
      </div>
    </div>
  );
}
