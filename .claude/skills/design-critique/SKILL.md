---
name: design-critique
description: Crítica de design estruturada de uma tela do Itinus (usabilidade, hierarquia, consistência com o DS, acessibilidade) olhando a tela de verdade no celular e no desktop. Use quando o usuário pedir "critica essa tela", "o que acha dessa página?", "revisa o design de /rota", mandar print/URL pedindo opinião, ou antes de dar uma tela nova por pronta. Só reporta — não corrige sem pedido.
argument-hint: "<rota (ex.: /schedule), URL, print ou descrição>"
---

# Crítica de design (Itinus)

Adaptada da `design-critique` da Anthropic (`anthropics/knowledge-work-plugins`,
Apache-2.0) para as regras deste projeto. O framework genérico continua; a
diferença é a **lente do projeto** (seção 6) e o fato de olhar a tela real.

## 1. Pegar a tela

- **Rota** (ex.: `/schedule`): abra `http://localhost:3001<rota>` com o
  chrome-devtools (`navigate_page`), logado. Capture **celular 360×800** e
  **desktop 1440×900** (`resize_page` + `take_screenshot`). Breakpoints do
  projeto: `tablet` ≥760, `desktop` ≥1024.
- Estados que importam: vazio, carregando (skeleton), erro, lista longa, nome
  comprido, modal/drawer aberto, tooltip. Peça ou provoque os que faltarem.
- **Print/descrição**: use o que veio. Sem nada → peça a rota ou um print; não
  invente a tela.
- Contexto: quem usa (dono/admin, vendedor na rua, cliente no portal, SU) e em
  que estágio está (exploração, refinamento, pronto).

## 2. Primeira impressão (2 segundos)

O que puxa o olho primeiro, e é isso mesmo? O propósito fica óbvio?

## 3. Usabilidade

Dá para cumprir o objetivo? Passos sobrando? Ação principal evidente? O
vendedor consegue fazer com uma mão, no celular, na rua?

## 4. Hierarquia visual

Ordem de leitura, ênfase, respiro, tipografia (vem do `<Title>`).

## 5. Consistência e acessibilidade

Mesmo padrão em elementos iguais; contraste; alvo de toque ≥ 44px; texto
legível; ícone sem rótulo.

## 6. Lente do projeto (obrigatória)

Confira contra as regras já decididas — estão na memória do projeto
(`~/.claude/projects/-home-michael-Documents-projects-project-name/memory/`) e
em `~/Documents/obsidian-vault/project_name/PATTERNS/ds-usage-rules.md`. Leia o
arquivo da regra quando o achado depender dela.

- **Público idoso → simplicidade** (`user_elderly_audience_simplicity`): menos
  coisa na tela, palavras simples, nada que exija adivinhar.
- **Só peças do DS** (`feedback_screens_only_ds_pieces`); taxonomia de botões
  (`feedback_button_taxonomy`); botão só-ícone com label
  (`feedback_icon_only_button_label`); contraste do âmbar
  (`feedback_amber_text_on_tint_contrast`).
- **Celular**: sem sobra de linha (`feedback_no_empty_row_space_mobile`);
  header que se adapta ao conteúdo (`feedback_header_actions_content_aware`);
  tooltip com teto na viewport (`feedback_tooltip_viewport_cap`).
- **Desktop**: tabela não rola de lado (`feedback_table_identity_column_no_hscroll`).
- **Filtros e massa**: a tela diz o escopo do filtro
  (`feedback_explain_filter_scope_on_screen`) e da ação em massa
  (`feedback_bulk_action_states_its_scope`).
- **Formulário**: placeholder em todo input, asterisco no obrigatório, label
  sem "(opcional)".
- **Modais**: nada de modal sobre modal; deleção confirma em modal.
- **Texto**: nomes em Title Case; nenhum nome de concorrente na tela.
- **Dados sensíveis**: vendedor nunca vê comissão/percentual da fábrica; entre
  escritórios só cruza score (`project_factory_commission_never_to_seller`,
  `project_cross_office_routine`).

## Como dar o retorno

- Específico ("o botão Salvar compete com o Exportar"), com o porquê (regra ou
  necessidade do usuário) e uma alternativa concreta.
- Diga o que funciona. Ajuste ao estágio.
- Quando achar a causa no código, aponte `arquivo:linha`.
- **Não edite nada** sem o usuário pedir.

## Saída (em pt-BR)

```markdown
## Crítica: [tela] — [celular / desktop]

### Impressão geral

[1–2 frases: o que funciona e a maior oportunidade]

### Achados

| #   | Achado | Onde            | Gravidade                           | Sugestão |
| --- | ------ | --------------- | ----------------------------------- | -------- |
| 1   | …      | celular, header | 🔴 Crítico / 🟡 Moderado / 🟢 Menor | …        |

### Lente do projeto

- [regra] — ok / viola: [como]

### O que funciona

- …

### Prioridades

1. **[mudança de maior impacto]** — por quê e como
2. …
3. …
```

Anexe os prints usados (caminho absoluto no scratchpad).
