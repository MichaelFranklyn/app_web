---
name: landing-page
description: Guia para criar ou redesenhar a landing pública do Itinus (src/app/(marketing)) — direção de arte, estrutura de seções, prints reais do produto, copy e verificação. Use sempre que mexer na página inicial, em /precos ou em qualquer seção de marketing.
---

# Landing do Itinus

Adaptada do `frontend-design` (plugin oficial) para as regras deste projeto.

## Direção de arte

- **Ancorada no assunto.** O Itinus é rotina de visita, rota e comissão de representação comercial.
  O motivo visual é o **trajeto**: uma linha tracejada com paradas numeradas (`#1`, `#2`…), igual à da
  rota do dia dentro do produto. Use esse motivo, não ilustração genérica de SaaS.
- **Marca = âmbar** (`--color-action`, texto `--color-on-action` branco). Cores de módulo (`--mod-*`)
  só como acento de ícone, nunca como fundo cheio.
- **Evite os clichês.** Nada de eyebrow em caixa alta em toda seção, fade-up em tudo, seta em todo
  link, numeração 01/02/03 decorativa, gradiente roxo e grade de oito cartões iguais.
- Tipografia só via `Title` (variants do DS). Espaçamento em px (`gap-12`, `px-24`).
  Breakpoints `tablet:` e `desktop:`.
- **A escala de spacing é discreta** (0–10, 12, 16, 20, 24, 32, 40, 48, 64). Fora dela o Tailwind cai
  no ×4: `gap-56` vira 224px. Valor fora da escala vai arbitrário: `gap-[56px]`, `py-[96px]`.

## Conteúdo

- **Prints reais**, nunca telas desenhadas em código: `public/marketing/*.webp` (browser 1440×900 em
  DPR 2, celular 412×915). Capture só da conta demo, nunca de tenant real. Use o roteiro da memória
  `project_marketing_landing_route_group`.
- **Sem números inventados** (clientes, % de ganho, depoimentos). Os números que aparecem nos prints
  são da demo e só podem aparecer ali.
- **Sem nome de concorrente**, sem "inteligência artificial". A copy fala do resultado, não do mecanismo.
- O público inclui gente mais velha: frase curta, verbo concreto, contraste AA.
- Planos e dias de teste saem de `plans.ts` (`TRIAL_DAYS`).

## Estrutura técnica

- Componentes de servidor. A `/` é estática. Ilha cliente só onde há estado (a vitrine do hero e os links do header).
- Toda seção usa `Section` (`tone` default/raised alternando, ou `tone="ink"` para a faixa escura do fechamento).
  Mudou a ordem, confira a alternância.
- Prints pelo `ScreenFrame`; o recorte de um print (bento) pelo `ScreenCrop`.
- Animação só em CSS, com `prefers-reduced-motion` respeitado (a regra global zera as animações).
- Âncoras do header: `#rotina`, `#recursos`, `#como-funciona` e `#planos` precisam existir.

## Processo

1. Esboce o wireframe ASCII antes de codar.
2. Implemente e tire screenshot em 1920×993 e 375×812 (página demo do chrome-devtools, nunca o tenant real).
3. Critique o screenshot: hierarquia, ritmo entre seções, o que convida a rolar.
4. Rode `npx tsc --noEmit`, `npx eslint 'src/app/(marketing)'`, `npx vitest run` e
   `npx playwright test e2e/routes/marketing.spec.ts`. Ajuste o spec se um título mudar.
