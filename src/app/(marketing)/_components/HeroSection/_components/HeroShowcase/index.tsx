"use client";

import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  ClipboardList,
  Coins,
  Lightbulb,
  LucideIcon,
  MapPin,
  Route,
} from "lucide-react";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { ScreenFrame } from "../../../ScreenFrame";

/** Tempo de cada tela antes de a vitrine passar para a próxima. */
const SLIDE_MS = 6000;

const SCREENS: {
  key: string;
  label: string;
  icon: LucideIcon;
  src: string;
  caption: string;
  alt: string;
}[] = [
  {
    key: "rota",
    label: "Rota do dia",
    icon: MapPin,
    src: "/marketing/rota-do-dia.webp",
    caption:
      "A ordem das visitas, o horário e a prioridade de cada cliente — e quem entra como ligação.",
    alt: "Rota do dia no Itinus: visitas numeradas com horário, cliente e prioridade.",
  },
  {
    key: "semana",
    label: "Semana",
    icon: CalendarDays,
    src: "/marketing/agenda-semana.webp",
    caption:
      "Visitas e ligações de cada dia num quadro só, sem perguntar a ninguém onde cada um está.",
    alt: "Agenda da semana no Itinus: as visitas e ligações de cada dia.",
  },
  {
    key: "montar",
    label: "Montar a semana",
    icon: Route,
    src: "/marketing/montar-semana.webp",
    caption:
      "Os clientes que precisam de visita, por prioridade e agrupados por região.",
    alt: "Montagem da semana no Itinus: clientes sugeridos para visita, por prioridade.",
  },
  {
    key: "pedidos",
    label: "Pedidos",
    icon: ClipboardList,
    src: "/marketing/pedidos.webp",
    caption:
      "Tudo o que a equipe vendeu, por situação: em aberto, faturado, entregue.",
    alt: "Pedidos no Itinus: totais do mês e cada pedido com cliente, fábrica, valor e situação.",
  },
  {
    key: "comissoes",
    label: "Comissões",
    icon: Coins,
    src: "/marketing/comissoes.webp",
    caption: "O que cada fábrica deve no mês e quanto já entrou de cada uma.",
    alt: "Comissões no Itinus: a receber, previsto e recebido, por fábrica.",
  },
  {
    key: "oportunidades",
    label: "Oportunidades",
    icon: Lightbulb,
    src: "/marketing/oportunidades.webp",
    caption:
      "Clientes no momento de recomprar e prioritários que ficaram fora da rota.",
    alt: "Oportunidades no Itinus: clientes no momento de recomprar.",
  },
];

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * A primeira dobra em movimento, com PRINTS REAIS da conta demo (19/11/2026).
 * A versão de 18/11 desenhava as telas em código; o usuário pediu o conteúdo
 * de verdade — o visitante quer ver o sistema, não uma ilustração dele.
 *
 * As abas em pílula escolhem a tela; os prints ficam empilhados dentro da
 * mesma moldura e trocam por opacidade (sem a página pular de altura).
 *
 * A troca é guiada pela PRÓPRIA barra de progresso da aba ativa: quando a
 * animação termina, a vitrine avança. Um só relógio — sem `setInterval`
 * descasando da barra depois de uma aba em segundo plano.
 *
 * Para quando o leitor está olhando (mouse em cima ou foco dentro) e de vez
 * quando ele escolhe uma tela. Com movimento reduzido, nunca anda. No servidor
 * nasce parada na primeira tela (`getServerSnapshot` diz "movimento reduzido").
 *
 * Abaixo do `tablet` só aparece o celular, que é a tela do vendedor na rua.
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
      className="flex flex-col items-center gap-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div
        role="group"
        aria-label="Telas do Itinus"
        className="tablet:flex hidden flex-wrap justify-center gap-8"
      >
        {SCREENS.map((item, index) => {
          const isActive = index === active;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => choose(index)}
              className={cn(
                "relative flex items-center gap-8 overflow-hidden rounded-(--radius-full) border px-16 py-8 transition-colors",
                isActive
                  ? "border-(--color-action) bg-(--amber-bg) text-(--color-action-text)"
                  : "border-(--border) bg-(--bg) text-(--color-text-muted) hover:bg-(--bg3)"
              )}
            >
              <Icon aria-hidden className="size-[16px] shrink-0" />
              <Title
                as="span"
                variant="body-sm"
                weight={isActive ? "semibold" : "medium"}
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

      <div className="tablet:block tablet:pr-[72px] desktop:pr-[96px] relative flex w-full justify-center">
        <ScreenFrame
          address={`itinus · ${screen.label}`}
          className="tablet:block hidden"
        >
          <div className="relative aspect-[1440/900]">
            {SCREENS.map((item, index) => (
              <Image
                key={item.key}
                src={item.src}
                alt={index === active ? item.alt : ""}
                aria-hidden={index !== active}
                fill
                priority={index === 0}
                sizes="(min-width: 1280px) 1100px, 92vw"
                className={cn(
                  "object-cover object-top transition-opacity duration-500",
                  index === active ? "opacity-100" : "opacity-0"
                )}
              />
            ))}
          </div>
        </ScreenFrame>

        {/* O celular do vendedor sobrepõe o canto da janela: a mesma rota,
            na rua. No celular de quem visita a página, é a única tela. */}
        <ScreenFrame
          device="phone"
          src="/marketing/rota-celular.webp"
          alt="Rota do dia no celular do vendedor, com as visitas em ordem."
          sizes="(min-width: 1280px) 240px, (min-width: 768px) 200px, 260px"
          className="tablet:absolute tablet:right-0 tablet:-bottom-32 desktop:w-[240px] tablet:w-[200px] w-[260px]"
        />
      </div>

      {/* A legenda é anunciada só quando o LEITOR troca a tela — na troca
          automática, falaria a cada seis segundos. */}
      <Title
        variant="body-sm"
        color="secondary"
        aria-live={isAutoplay ? "off" : "polite"}
        className="tablet:block hidden max-w-[64ch] pt-16 text-center"
      >
        <strong>{screen.label}.</strong> {screen.caption}
      </Title>
    </div>
  );
}
