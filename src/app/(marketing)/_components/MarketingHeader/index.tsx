import { TextLink } from "@/components/TextLink";
import { Title } from "@/components/Title";
import Image from "next/image";
import Link from "next/link";
import { HeaderEntryLinks } from "../HeaderEntryLinks";

/**
 * Topo das páginas públicas: marca à esquerda, navegação no meio, portas de
 * entrada à direita.
 *
 * As portas da direita ficam em `HeaderEntryLinks`, a única ilha cliente do
 * topo: quem já está logado vê "Ir para o sistema" no lugar delas.
 *
 * Os CTAs apontam para rotas que já existem (`/login` e `/signup`, do grupo
 * `(auth)`) — é a vantagem de a landing morar no mesmo app: o funil inteiro é
 * navegação interna, sem salto de domínio no meio.
 *
 * TRAP — as âncoras são ABSOLUTAS (`/#recursos`, e não `#recursos`). O mesmo
 * header aparece em `/precos` e nas páginas legais, onde essas seções não
 * existem: uma âncora relativa ali não leva a lugar nenhum e o clique parece
 * quebrado.
 *
 * Os links do meio somem no celular, onde só cabem a marca e as duas portas —
 * "Entrar" e o cadastro. "Entrar" já sumiu ali uma vez (14/11/2026) e quem já
 * é cliente abria o site no celular sem achar o login: ele fica, e a logo e o
 * respiro encolhem para caber até em 360px. Um menu sanfonado exigiria estado, e estado aqui significaria
 * `"use client"` numa página que é servida do CDN — caro demais para esconder
 * quatro links que a rolagem já entrega.
 *
 * `sticky` porque a página é longa: sem isso, o botão de cadastro só volta a
 * existir no rodapé.
 */
const NAV = [
  { href: "/#rotina", label: "Rotina" },
  { href: "/#recursos", label: "Recursos" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/precos", label: "Preços" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-(--z-sticky) border-b border-(--border) bg-(--bg2)">
      <nav className="tablet:gap-24 mx-auto flex max-w-[1200px] items-center justify-between gap-12 px-24 py-16">
        <Link href="/" aria-label="Itinus — página inicial">
          <Image
            src="/horizontal_logo.svg"
            alt="Itinus"
            width={128}
            height={32}
            priority
            /* 128×32 é a proporção real do arquivo (viewBox 361×90). Com números
               fora da proporção, o `height: auto` do reset recalcula a altura,
               ela não bate com a declarada e o Next avisa no console. */
            className="tablet:w-[128px] h-auto w-[104px]"
          />
        </Link>

        <div className="tablet:flex hidden items-center gap-24">
          {NAV.map((item) => (
            <TextLink
              key={item.href}
              href={item.href}
              tone="inherit"
              underline="none"
              className="text-(--color-text-secondary)"
            >
              <Title variant="body-sm" color="inherit" weight="semibold">
                {item.label}
              </Title>
            </TextLink>
          ))}
        </div>

        <div className="tablet:gap-16 flex shrink-0 items-center gap-12">
          <HeaderEntryLinks />
        </div>
      </nav>
    </header>
  );
}
