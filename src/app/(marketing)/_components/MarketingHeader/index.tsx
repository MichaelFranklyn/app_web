import { Title } from "@/components/Title";
import Image from "next/image";
import Link from "next/link";
import { CtaLink } from "../CtaLink";

/**
 * Topo das páginas públicas: marca à esquerda, navegação no meio, portas de
 * entrada à direita.
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
 * Os links do meio somem no celular, onde só cabem a marca e o botão de
 * cadastro. Um menu sanfonado exigiria estado, e estado aqui significaria
 * `"use client"` numa página que é servida do CDN — caro demais para esconder
 * três links que a rolagem já entrega.
 *
 * `sticky` porque a página é longa: sem isso, o botão de cadastro só volta a
 * existir no rodapé.
 */
const NAV = [
  { href: "/#recursos", label: "Recursos" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/precos", label: "Preços" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-(--border) bg-(--bg2)">
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between gap-24 px-24 py-16">
        <Link href="/" aria-label="Girus — página inicial">
          <Image
            src="/horizontal_logo.svg"
            alt="Girus"
            width={124}
            height={32}
            priority
            /* 124×32 é a proporção real do arquivo (1500×384). Com números
               fora da proporção, o `height: auto` do reset recalcula a altura,
               ela não bate com a declarada e o Next avisa no console. */
            className="h-auto w-[124px]"
          />
        </Link>

        <div className="tablet:flex hidden items-center gap-24">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:opacity-70">
              <Title variant="body-sm" color="secondary" weight="semibold">
                {item.label}
              </Title>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-16">
          <Link href="/login" className="tablet:block hidden hover:opacity-70">
            <Title variant="body-sm" weight="semibold">
              Entrar
            </Title>
          </Link>

          <CtaLink href="/signup" size="sm">
            Testar grátis
          </CtaLink>
        </div>
      </nav>
    </header>
  );
}
